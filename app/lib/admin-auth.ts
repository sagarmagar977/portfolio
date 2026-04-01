import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE_NAME = "portfolio-admin-session";
const SESSION_PAYLOAD = "portfolio-admin";

function getAdminEmail() {
  return process.env.ADMIN_EMAIL ?? "owner@portfolio.local";
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "change-this-password";
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? `${getAdminPassword()}-session-secret`;
}

function signSessionValue() {
  return createHmac("sha256", getSessionSecret()).update(SESSION_PAYLOAD).digest("hex");
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

export function getAdminCredentials() {
  return {
    email: getAdminEmail(),
    password: getAdminPassword(),
  };
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!cookieValue) {
    return false;
  }

  return safeEqual(cookieValue, signSessionValue());
}

export async function requireAdmin() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }
}

export async function createAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, signSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
