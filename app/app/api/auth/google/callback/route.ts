import { NextRequest, NextResponse } from "next/server";
import {
  getAdminSessionCookieName,
  getAdminSessionCookieOptions,
  getAdminSessionCookieValue,
} from "@/lib/admin-auth";
import {
  consumeGoogleOAuthState,
  exchangeGoogleCodeForUser,
  findOrCreateGoogleAdminUser,
  getGoogleStateCookieName,
} from "@/lib/google-auth";

function buildRedirectUrl(request: NextRequest, path: string) {
  return new URL(path, request.nextUrl.origin);
}

export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(buildRedirectUrl(request, "/login?error=google_cancelled"));
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(buildRedirectUrl(request, "/login?error=google"));
  }

  const isValidState = await consumeGoogleOAuthState(state);

  if (!isValidState) {
    return NextResponse.redirect(buildRedirectUrl(request, "/login?error=google_state"));
  }

  try {
    const googleUser = await exchangeGoogleCodeForUser({
      code,
      origin: request.nextUrl.origin,
    });

    const adminUser = await findOrCreateGoogleAdminUser(googleUser);

    const response = NextResponse.redirect(buildRedirectUrl(request, "/admin"));
    response.cookies.set(
      getAdminSessionCookieName(),
      getAdminSessionCookieValue(adminUser.id),
      getAdminSessionCookieOptions(),
    );
    response.cookies.delete(getGoogleStateCookieName());
    return response;
  } catch (callbackError) {
    console.error("Google OAuth callback failed", callbackError);
    return NextResponse.redirect(buildRedirectUrl(request, "/login?error=google"));
  }
}
