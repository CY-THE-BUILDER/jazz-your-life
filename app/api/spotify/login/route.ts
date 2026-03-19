import { NextRequest, NextResponse } from "next/server";
import {
  buildSpotifyAuthorizeUrl,
  createCodeChallenge,
  createCodeVerifier,
  createOAuthState,
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
  persistOAuthCookies(state, verifier);
  const url = buildSpotifyAuthorizeUrl({
    origin: request.nextUrl.origin,
    state,
    challenge
  });

  return NextResponse.redirect(url);
}
