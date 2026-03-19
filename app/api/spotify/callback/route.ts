import { NextRequest, NextResponse } from "next/server";
import {
  clearOAuthCookies,
  clearSpotifyCookies,
  exchangeCodeForToken,
  getSpotifyRedirectUri,
  isSpotifyConfigured,
  persistSpotifyTokens,
  readOAuthCookies
} from "@/lib/spotify-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const appUrl = request.nextUrl.origin;
  const redirectUri = getSpotifyRedirectUri(appUrl);

  if (!isSpotifyConfigured()) {
    return NextResponse.redirect(new URL("/?spotify=misconfigured", appUrl));
  }

  if (error) {
    clearSpotifyCookies();
    return NextResponse.redirect(new URL("/?spotify=denied", appUrl));
  }

  const cookies = readOAuthCookies();
  if (!code || !state || cookies.state !== state || !cookies.verifier) {
    clearSpotifyCookies();
    return NextResponse.redirect(new URL("/?spotify=error", appUrl));
  }

  try {
    const tokens = await exchangeCodeForToken(code, cookies.verifier, redirectUri);
    persistSpotifyTokens(tokens);
    clearOAuthCookies();
    return NextResponse.redirect(new URL("/?spotify=connected", appUrl));
  } catch {
    clearSpotifyCookies();
    return NextResponse.redirect(new URL("/?spotify=error", appUrl));
  }
}
