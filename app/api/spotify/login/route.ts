import { NextRequest, NextResponse } from "next/server";
import {
  createCodeChallenge,
  createCodeVerifier,
  createOAuthState,
  getSpotifyClientId,
  getSpotifyRedirectUri,
  getSpotifyScopes,
  isSpotifyConfigured,
  persistOAuthCookies
} from "@/lib/spotify-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isSpotifyConfigured()) {
    return NextResponse.redirect(new URL("/?spotify=misconfigured", request.nextUrl.origin));
  }

  const verifier = createCodeVerifier();
  const challenge = await createCodeChallenge(verifier);
  const state = createOAuthState();
  const redirectUri = getSpotifyRedirectUri(request.nextUrl.origin);
  persistOAuthCookies(state, verifier);

  const url = new URL("https://accounts.spotify.com/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", getSpotifyClientId());
  url.searchParams.set("scope", getSpotifyScopes());
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("code_challenge", challenge);

  return NextResponse.redirect(url);
}
