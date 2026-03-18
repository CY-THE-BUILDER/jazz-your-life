import { NextResponse } from "next/server";
import {
  clearSpotifyCookies,
  fetchSpotifyProfile,
  getValidSpotifyAccessToken,
  isSpotifyConfigured
} from "@/lib/spotify-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSpotifyConfigured()) {
    return NextResponse.json({
      configured: false,
      connected: false
    }, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }

  const accessToken = await getValidSpotifyAccessToken();
  if (!accessToken) {
    return NextResponse.json({
      configured: true,
      connected: false
    }, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }

  try {
    const profile = await fetchSpotifyProfile(accessToken);
    return NextResponse.json({
      configured: true,
      connected: true,
      displayName: profile.display_name ?? "Spotify listener",
      avatarUrl: profile.images?.[0]?.url ?? null,
      product: profile.product ?? null,
      profileUrl: profile.external_urls?.spotify ?? null,
      country: profile.country ?? null
    }, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch {
    clearSpotifyCookies();
    return NextResponse.json({
      configured: true,
      connected: false
    }, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }
}
