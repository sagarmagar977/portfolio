import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "portfolio-session";
const SESSION_VERSION = "v1";
const SCRYPT_PARAMS = {
  cost: 32768,
  blockSize: 8,
  parallelization: 1,
  keyLength: 64,
  maxMemory: 64 * 1024 * 1024,
};

function getSessionSecret() {
  return process.env.AUTH_SESSION_SECRET ?? process.env.ADMIN_SESSION_SECRET ?? "change-me-session-secret";
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

function scryptAsync(password: string, salt: string, keyLength: number, options: { N: number; r: number; p: number }) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keyLength, { ...options, maxmem: SCRYPT_PARAMS.maxMemory }, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, SCRYPT_PARAMS.keyLength, {
    N: SCRYPT_PARAMS.cost,
    r: SCRYPT_PARAMS.blockSize,
    p: SCRYPT_PARAMS.parallelization,
  });

  return `scrypt:${SCRYPT_PARAMS.cost}:${SCRYPT_PARAMS.blockSize}:${SCRYPT_PARAMS.parallelization}$${salt}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, passwordHash: string | null | undefined) {
  if (!passwordHash) {
    return false;
  }

  const [schemeWithParams, salt, expectedHash] = passwordHash.split("$");

  if (!schemeWithParams || !salt || !expectedHash || !schemeWithParams.startsWith("scrypt:")) {
    return false;
  }

  const [, cost, blockSize, parallelization] = schemeWithParams.split(":");
  const derivedKey = await scryptAsync(password, salt, expectedHash.length / 2, {
    N: Number(cost),
    r: Number(blockSize),
    p: Number(parallelization),
  });

  return safeEqual(derivedKey.toString("hex"), expectedHash);
}

type SessionData = {
  userId: string;
};

function serializeSession(data: SessionData) {
  const payload = `${SESSION_VERSION}:${data.userId}`;
  return `${payload}.${sign(payload)}`;
}

export function getAdminSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function getAdminSessionCookieValue(userId: string) {
  return serializeSession({ userId });
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

function parseSession(cookieValue: string | undefined): SessionData | null {
  if (!cookieValue) {
    return null;
  }

  const lastSeparator = cookieValue.lastIndexOf(".");

  if (lastSeparator === -1) {
    return null;
  }

  const payload = cookieValue.slice(0, lastSeparator);
  const signature = cookieValue.slice(lastSeparator + 1);

  if (!safeEqual(signature, sign(payload))) {
    return null;
  }

  const [version, userId] = payload.split(":");

  if (version !== SESSION_VERSION || !userId) {
    return null;
  }

  return { userId };
}

export async function createAdminSession(userId: string) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, getAdminSessionCookieValue(userId), getAdminSessionCookieOptions());
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getAuthenticatedAdmin() {
  const cookieStore = await cookies();
  const session = parseSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return null;
  }

  return prisma.adminUser.findUnique({
    where: { id: session.userId },
    include: { profile: true },
  });
}

export async function isAdminAuthenticated() {
  const adminUser = await getAuthenticatedAdmin();
  return Boolean(adminUser);
}

export async function requireAdmin() {
  const adminUser = await getAuthenticatedAdmin();

  if (!adminUser) {
    redirect("/login");
  }

  if (!adminUser.profile) {
    redirect("/register?error=profile");
  }

  return adminUser;
}
