import { JazzPick } from "@/types/jazz";

export function getSpotifyActionUrl(pick: Pick<JazzPick, "spotifyUrl">) {
  return pick.spotifyUrl;
}
