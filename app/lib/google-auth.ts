import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { hashPassword } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { buildDefaultProfileData, buildUniqueProfileSlug } from "@/lib/profile-defaults";

const GOOGLE_STATE_COOKIE_NAME = "google-oauth-state";
const GOOGLE_STATE_MAX_AGE_SECONDS = 60 * 10;

type GoogleAuthMode = "login" | "register";

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfo = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
};

function getGoogleClientId() {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not set.");
  }

  return clientId;
}

function getGoogleClientSecret() {
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientSecret) {
    throw new Error("GOOGLE_CLIENT_SECRET is not set.");
  }

  return clientSecret;
}

export function normalizeGoogleAuthMode(value: string | null | undefined): GoogleAuthMode {
  return value === "register" ? "register" : "login";
}

export function getGoogleCallbackUrl(origin: string) {
  return `${origin}/api/auth/google/callback`;
}

export async function createGoogleOAuthState(mode: GoogleAuthMode) {
  const state = randomBytes(24).toString("hex");
  const cookieStore = await cookies();

  cookieStore.set(GOOGLE_STATE_COOKIE_NAME, `${state}:${mode}`, getGoogleStateCookieOptions());

  return state;
}

export function getGoogleStateCookieName() {
  return GOOGLE_STATE_COOKIE_NAME;
}

export function getGoogleStateCookieValue(state: string, mode: GoogleAuthMode) {
  return `${state}:${mode}`;
}

export function getGoogleStateCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: GOOGLE_STATE_MAX_AGE_SECONDS,
  };
}

export async function consumeGoogleOAuthState(expectedState: string) {
  const cookieStore = await cookies();
  const rawValue = cookieStore.get(GOOGLE_STATE_COOKIE_NAME)?.value;
  cookieStore.delete(GOOGLE_STATE_COOKIE_NAME);

  if (!rawValue) {
    return null;
  }

  const separatorIndex = rawValue.lastIndexOf(":");

  if (separatorIndex === -1) {
    return null;
  }

  const state = rawValue.slice(0, separatorIndex);
  const mode = normalizeGoogleAuthMode(rawValue.slice(separatorIndex + 1));

  if (state !== expectedState) {
    return null;
  }

  return { mode };
}

export function buildGoogleAuthorizationUrl(options: {
  origin: string;
  mode: GoogleAuthMode;
  prompt?: "consent" | "select_account";
}) {
  const state = options.mode;
  const params = new URLSearchParams({
    client_id: getGoogleClientId(),
    redirect_uri: getGoogleCallbackUrl(options.origin),
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    include_granted_scopes: "true",
    state,
  });

  if (options.prompt) {
    params.set("prompt", options.prompt);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCodeForUser(options: {
  code: string;
  origin: string;
}) {
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code: options.code,
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      redirect_uri: getGoogleCallbackUrl(options.origin),
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;

  if (!tokenResponse.ok || !tokenData.access_token) {
    throw new Error(tokenData.error_description || tokenData.error || "Google token exchange failed.");
  }

  const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
    cache: "no-store",
  });

  const userData = (await userResponse.json()) as GoogleUserInfo;

  if (!userResponse.ok || !userData.sub || !userData.email || !userData.email_verified) {
    throw new Error("Google user profile is missing a verified email.");
  }

  return {
    googleId: userData.sub,
    email: userData.email.trim().toLowerCase(),
    fullName: userData.name?.trim() || userData.email.split("@")[0] || "Portfolio Owner",
  };
}

export async function findOrCreateGoogleAdminUser(options: {
  googleId: string;
  email: string;
  fullName: string;
}) {
  const existingByGoogleId = await prisma.adminUser.findUnique({
    where: { googleId: options.googleId },
    include: { profile: true },
  });

  if (existingByGoogleId) {
    return existingByGoogleId;
  }

  const existingByEmail = await prisma.adminUser.findUnique({
    where: { email: options.email },
    include: { profile: true },
  });

  if (existingByEmail) {
    if (existingByEmail.googleId === options.googleId) {
      return existingByEmail;
    }

    return prisma.adminUser.update({
      where: { id: existingByEmail.id },
      data: { googleId: options.googleId },
      include: { profile: true },
    });
  }

  const slug = await buildUniqueProfileSlug(options.fullName || options.email.split("@")[0] || "my-portfolio");
  const passwordHash = await hashPassword(randomBytes(32).toString("hex"));

  return prisma.adminUser.create({
    data: {
      email: options.email,
      passwordHash,
      googleId: options.googleId,
      profile: {
        create: buildDefaultProfileData({
          fullName: options.fullName,
          slug,
          email: options.email,
        }),
      },
    },
    include: { profile: true },
  });
}
