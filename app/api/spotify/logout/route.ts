import { NextResponse } from "next/server";
import { clearSpotifyCookies } from "@/lib/spotify-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  clearSpotifyCookies();
  return NextResponse.json({ ok: true });
}
