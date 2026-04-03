import { NextRequest, NextResponse } from "next/server";
import {
  buildGoogleAuthorizationUrl,
  createGoogleOAuthState,
  getGoogleStateCookieName,
  getGoogleStateCookieOptions,
  getGoogleStateCookieValue,
  normalizeGoogleAuthMode,
} from "@/lib/google-auth";

export async function GET(request: NextRequest) {
  const mode = normalizeGoogleAuthMode(request.nextUrl.searchParams.get("mode"));
  const state = await createGoogleOAuthState(mode);
  const origin = request.nextUrl.origin;
  const authorizationUrl = new URL(buildGoogleAuthorizationUrl({ origin, mode, prompt: "select_account" }));

  authorizationUrl.searchParams.set("state", state);
  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set(getGoogleStateCookieName(), getGoogleStateCookieValue(state, mode), getGoogleStateCookieOptions());
  return response;
}
