import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { ensureUniqueFeeds } from "@/lib/recommendation-feeds";

const mockGetValidSpotifyAccessToken = vi.fn();
const mockSpotifyGet = vi.fn();

vi.mock("@/lib/spotify-auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/spotify-auth")>("@/lib/spotify-auth");
  return {
    ...actual,
    getValidSpotifyAccessToken: mockGetValidSpotifyAccessToken,
    spotifyGet: mockSpotifyGet
  };
});

vi.mock("@/lib/cover-art", async () => {
  const actual = await vi.importActual<typeof import("@/lib/cover-art")>("@/lib/cover-art");
  return {
    ...actual,
    hydratePublicArtworkForPick: vi.fn(async (pick) => ({
      ...pick,
      imageUrl:
        pick.imageUrl ||
        `https://image-cdn.test/${encodeURIComponent(pick.id)}.jpg`
    }))
  };
});

function track(params: {
  id: string;
  name: string;
  artistId: string;
  artistName: string;
  albumId: string;
  albumName: string;
  albumImage?: string;
  releaseDate?: string;
}) {
  return {
    id: params.id,
    name: params.name,
    duration_ms: 300000,
    artists: [{ id: params.artistId, name: params.artistName }],
    album: {
      id: params.albumId,
      name: params.albumName,
      release_date: params.releaseDate ?? "1973-01-01",
      images: params.albumImage ? [{ url: params.albumImage }] : [],
      external_urls: {
        spotify: `https://open.spotify.com/album/${params.albumId}`
      },
      artists: [{ id: params.artistId, name: params.artistName }]
    },
    external_urls: {
      spotify: `https://open.spotify.com/track/${params.id}`
    }
  };
}

describe("recommendations route", () => {
  beforeEach(() => {
    vi.resetModules();
    mockGetValidSpotifyAccessToken.mockReset();
    mockSpotifyGet.mockReset();
  });

  it("keeps personalized shelves alive when one Spotify signal endpoint fails", async () => {
    mockGetValidSpotifyAccessToken.mockResolvedValue("token");
    mockSpotifyGet.mockImplementation(async (_token: string, path: string) => {
      if (path === "/me/top/artists") {
        throw new Error("temporary spotify failure");
      }

      if (path === "/me/top/tracks") {
        return {
          items: [
            track({
              id: "track-1",
              name: "Spain",
              artistId: "artist-rtf",
              artistName: "Return to Forever",
              albumId: "album-light-as-a-feather",
              albumName: "Light as a Feather",
              albumImage: "https://i.scdn.co/image/light-as-a-feather"
            })
          ]
        };
      }

      if (path === "/me/player/recently-played") {
        return {
          items: [
            {
              track: track({
                id: "track-2",
                name: "500 Miles High",
                artistId: "artist-rtf",
                artistName: "Return to Forever",
                albumId: "album-light-as-a-feather",
                albumName: "Light as a Feather",
                albumImage: "https://i.scdn.co/image/light-as-a-feather"
              })
            }
          ]
        };
      }

      if (path === "/me/tracks") {
        return {
          items: [
            {
              track: track({
                id: "track-3",
                name: "Vulcan Worlds",
                artistId: "artist-rtf-2",
                artistName: "Return to Forever",
                albumId: "album-where-have-i-known-you-before",
                albumName: "Where Have I Known You Before",
                albumImage: "https://i.scdn.co/image/where-have-i-known-you-before",
                releaseDate: "1974-01-01"
              })
            }
          ]
        };
      }

      if (path === "/search") {
        return {
          albums: {
            items: [
              {
                id: "album-romantic-warrior",
                name: "Romantic Warrior",
                release_date: "1976-01-01",
                images: [{ url: "https://i.scdn.co/image/romantic-warrior" }],
                external_urls: {
                  spotify: "https://open.spotify.com/album/album-romantic-warrior"
                },
                artists: [{ id: "artist-rtf", name: "Return to Forever" }]
              }
            ]
          }
        };
      }

      throw new Error(`Unexpected path ${path}`);
    });

    const { GET } = await import("@/app/api/jazz/recommendations/route");
    const request = new NextRequest("https://vanguard.noesis.studio/api/jazz/recommendations?vibe=Fusion&limit=3");
    const response = await GET(request);
    const payload = await response.json();

    expect(payload.mode).toBe("personalized");
    expect(payload.picks.length).toBeGreaterThan(0);
    expect(payload.picks.every((pick: { source?: string }) => pick.source === "spotify")).toBe(true);
    expect(payload.picks.every((pick: { imageUrl?: string }) => typeof pick.imageUrl === "string" && pick.imageUrl.length > 0)).toBe(true);
    expect(payload.picks.some((pick: { title: string }) => pick.title === "Light as a Feather")).toBe(true);
  });

  it("does not collapse the whole request to curated when Spotify search fails for one query", async () => {
    mockGetValidSpotifyAccessToken.mockResolvedValue("token");
    mockSpotifyGet.mockImplementation(async (_token: string, path: string, searchParams?: Record<string, string | number | undefined>) => {
      if (path === "/me/top/artists") {
        return {
          items: [
            {
              id: "artist-bill-evans",
              name: "Bill Evans",
              genres: ["piano jazz", "cool jazz"]
            }
          ]
        };
      }

      if (path === "/me/top/tracks") {
        return {
          items: [
            track({
              id: "track-focus-1",
              name: "My Foolish Heart",
              artistId: "artist-bill-evans",
              artistName: "Bill Evans",
              albumId: "album-waltz-for-debby",
              albumName: "Waltz for Debby",
              albumImage: "https://i.scdn.co/image/waltz-for-debby",
              releaseDate: "1961-01-01"
            })
          ]
        };
      }

      if (path === "/me/player/recently-played") {
        return { items: [] };
      }

      if (path === "/me/tracks") {
        return { items: [] };
      }

      if (path === "/search") {
        if (String(searchParams?.q ?? "").includes("piano jazz")) {
          throw new Error("one search query failed");
        }

        return {
          albums: {
            items: [
              {
                id: "album-undercurrent",
                name: "Undercurrent",
                release_date: "1962-01-01",
                images: [{ url: "https://i.scdn.co/image/undercurrent" }],
                external_urls: {
                  spotify: "https://open.spotify.com/album/album-undercurrent"
                },
                artists: [{ id: "artist-bill-evans", name: "Bill Evans" }]
              }
            ]
          }
        };
      }

      throw new Error(`Unexpected path ${path}`);
    });

    const { GET } = await import("@/app/api/jazz/recommendations/route");
    const request = new NextRequest("https://vanguard.noesis.studio/api/jazz/recommendations?vibe=Focus&limit=3");
    const response = await GET(request);
    const payload = await response.json();

    expect(payload.mode).toBe("personalized");
    expect(payload.picks.every((pick: { source?: string }) => pick.source === "spotify")).toBe(true);
    expect(payload.note).toContain("貼近 Focus");
  });

  it("returns a personalized classic shelf when the listener mostly listens to classic and piano jazz artists", async () => {
    mockGetValidSpotifyAccessToken.mockResolvedValue("token");
    mockSpotifyGet.mockImplementation(async (_token: string, path: string) => {
      if (path === "/me/top/artists") {
        return {
          items: [
            {
              id: "artist-bill-evans",
              name: "Bill Evans",
              genres: ["piano jazz", "cool jazz"]
            },
            {
              id: "artist-miles",
              name: "Miles Davis",
              genres: ["modal jazz", "jazz trumpet"]
            }
          ]
        };
      }

      if (path === "/me/top/tracks") {
        return {
          items: [
            track({
              id: "track-classic-1",
              name: "My Foolish Heart",
              artistId: "artist-bill-evans",
              artistName: "Bill Evans",
              albumId: "album-waltz-for-debby",
              albumName: "Waltz for Debby",
              albumImage: "https://i.scdn.co/image/waltz-for-debby",
              releaseDate: "1961-01-01"
            }),
            track({
              id: "track-classic-2",
              name: "So What",
              artistId: "artist-miles",
              artistName: "Miles Davis",
              albumId: "album-kind-of-blue",
              albumName: "Kind of Blue",
              albumImage: "https://i.scdn.co/image/kind-of-blue",
              releaseDate: "1959-01-01"
            })
          ]
        };
      }

      if (path === "/me/player/recently-played") {
        return { items: [] };
      }

      if (path === "/me/tracks") {
        return { items: [] };
      }

      if (path === "/search") {
        return {
          albums: {
            items: [
              {
                id: "album-sunday-vanguard",
                name: "Sunday at the Village Vanguard",
                release_date: "1961-01-01",
                images: [{ url: "https://i.scdn.co/image/sunday-vanguard" }],
                external_urls: {
                  spotify: "https://open.spotify.com/album/album-sunday-vanguard"
                },
                artists: [{ id: "artist-bill-evans", name: "Bill Evans Trio" }]
              }
            ]
          }
        };
      }

      throw new Error(`Unexpected path ${path}`);
    });

    const { GET } = await import("@/app/api/jazz/recommendations/route");
    const request = new NextRequest("https://vanguard.noesis.studio/api/jazz/recommendations?vibe=Classic&limit=5");
    const response = await GET(request);
    const payload = await response.json();

    expect(payload.mode).toBe("personalized");
    expect(payload.picks.length).toBeGreaterThan(0);
    expect(payload.picks.some((pick: { source?: string }) => pick.source === "spotify")).toBe(true);
  });

  it("keeps all five connected shelves filled to five unique albums while preserving Spotify picks", async () => {
    mockGetValidSpotifyAccessToken.mockResolvedValue("token");
    mockSpotifyGet.mockImplementation(async (_token: string, path: string, searchParams?: Record<string, string | number | undefined>) => {
      if (path === "/me/top/artists") {
        return {
          items: [
            { id: "artist-bill-evans", name: "Bill Evans", genres: ["piano jazz", "cool jazz"] },
            { id: "artist-wayne", name: "Wayne Shorter", genres: ["post-bop", "modal jazz"] },
            { id: "artist-herbie", name: "Herbie Hancock", genres: ["jazz fusion", "jazz funk"] },
            { id: "artist-grant", name: "Grant Green", genres: ["jazz guitar", "soul jazz"] },
            { id: "artist-rtf", name: "Return to Forever", genres: ["jazz fusion"] }
          ]
        };
      }

      if (path === "/me/top/tracks") {
        return {
          items: [
            track({
              id: "track-classic-1",
              name: "My Foolish Heart",
              artistId: "artist-bill-evans",
              artistName: "Bill Evans",
              albumId: "album-waltz-for-debby",
              albumName: "Waltz for Debby",
              albumImage: "https://i.scdn.co/image/waltz-for-debby",
              releaseDate: "1961-01-01"
            }),
            track({
              id: "track-late-1",
              name: "Infant Eyes",
              artistId: "artist-wayne",
              artistName: "Wayne Shorter",
              albumId: "album-speak-no-evil",
              albumName: "Speak No Evil",
              albumImage: "https://i.scdn.co/image/speak-no-evil",
              releaseDate: "1966-01-01"
            }),
            track({
              id: "track-fusion-1",
              name: "Chameleon",
              artistId: "artist-herbie",
              artistName: "Herbie Hancock",
              albumId: "album-head-hunters",
              albumName: "Head Hunters",
              albumImage: "https://i.scdn.co/image/head-hunters",
              releaseDate: "1973-01-01"
            }),
            track({
              id: "track-focus-1",
              name: "Idle Moments",
              artistId: "artist-grant",
              artistName: "Grant Green",
              albumId: "album-idle-moments",
              albumName: "Idle Moments",
              albumImage: "https://i.scdn.co/image/idle-moments",
              releaseDate: "1963-01-01"
            }),
            track({
              id: "track-fusion-2",
              name: "Spain",
              artistId: "artist-rtf",
              artistName: "Return to Forever",
              albumId: "album-light-as-a-feather",
              albumName: "Light as a Feather",
              albumImage: "https://i.scdn.co/image/light-as-a-feather",
              releaseDate: "1973-01-01"
            })
          ]
        };
      }

      if (path === "/me/player/recently-played") {
        return {
          items: [
            {
              track: track({
                id: "track-recent-1",
                name: "Night Dreamer",
                artistId: "artist-wayne",
                artistName: "Wayne Shorter",
                albumId: "album-night-dreamer",
                albumName: "Night Dreamer",
                albumImage: "https://i.scdn.co/image/night-dreamer",
                releaseDate: "1964-01-01"
              })
            },
            {
              track: track({
                id: "track-recent-2",
                name: "Undercurrent",
                artistId: "artist-bill-evans",
                artistName: "Bill Evans & Jim Hall",
                albumId: "album-undercurrent",
                albumName: "Undercurrent",
                albumImage: "https://i.scdn.co/image/undercurrent",
                releaseDate: "1962-01-01"
              })
            }
          ]
        };
      }

      if (path === "/me/tracks") {
        return {
          items: [
            {
              track: track({
                id: "track-saved-1",
                name: "Maiden Voyage",
                artistId: "artist-herbie",
                artistName: "Herbie Hancock",
                albumId: "album-maiden-voyage",
                albumName: "Maiden Voyage",
                albumImage: "https://i.scdn.co/image/maiden-voyage",
                releaseDate: "1965-01-01"
              })
            },
            {
              track: track({
                id: "track-saved-2",
                name: "Bright Size Life",
                artistId: "artist-pat",
                artistName: "Pat Metheny",
                albumId: "album-bright-size-life",
                albumName: "Bright Size Life",
                albumImage: "https://i.scdn.co/image/bright-size-life",
                releaseDate: "1976-01-01"
              })
            }
          ]
        };
      }

      if (path === "/search") {
        const query = String(searchParams?.q ?? "");

        if (query.includes("Bill Evans")) {
          return {
            albums: {
              items: [
                {
                  id: "album-sunday-vanguard",
                  name: "Sunday at the Village Vanguard",
                  release_date: "1961-01-01",
                  images: [{ url: "https://i.scdn.co/image/sunday-vanguard" }],
                  external_urls: { spotify: "https://open.spotify.com/album/album-sunday-vanguard" },
                  artists: [{ id: "artist-bill-evans", name: "Bill Evans Trio" }]
                },
                {
                  id: "album-moon-beams",
                  name: "Moon Beams",
                  release_date: "1962-01-01",
                  images: [{ url: "https://i.scdn.co/image/moon-beams" }],
                  external_urls: { spotify: "https://open.spotify.com/album/album-moon-beams" },
                  artists: [{ id: "artist-bill-evans", name: "Bill Evans Trio" }]
                }
              ]
            }
          };
        }

        if (query.includes("Wayne Shorter")) {
          return {
            albums: {
              items: [
                {
                  id: "album-night-dreamer-search",
                  name: "Night Dreamer",
                  release_date: "1964-01-01",
                  images: [{ url: "https://i.scdn.co/image/night-dreamer-search" }],
                  external_urls: { spotify: "https://open.spotify.com/album/album-night-dreamer-search" },
                  artists: [{ id: "artist-wayne", name: "Wayne Shorter" }]
                },
                {
                  id: "album-adam-apple",
                  name: "Adam's Apple",
                  release_date: "1967-01-01",
                  images: [{ url: "https://i.scdn.co/image/adams-apple" }],
                  external_urls: { spotify: "https://open.spotify.com/album/album-adam-apple" },
                  artists: [{ id: "artist-wayne", name: "Wayne Shorter" }]
                }
              ]
            }
          };
        }

        if (query.includes("Herbie Hancock")) {
          return {
            albums: {
              items: [
                {
                  id: "album-thrust",
                  name: "Thrust",
                  release_date: "1974-01-01",
                  images: [{ url: "https://i.scdn.co/image/thrust" }],
                  external_urls: { spotify: "https://open.spotify.com/album/album-thrust" },
                  artists: [{ id: "artist-herbie", name: "Herbie Hancock" }]
                },
                {
                  id: "album-sextant-search",
                  name: "Sextant",
                  release_date: "1973-01-01",
                  images: [{ url: "https://i.scdn.co/image/sextant-search" }],
                  external_urls: { spotify: "https://open.spotify.com/album/album-sextant-search" },
                  artists: [{ id: "artist-herbie", name: "Herbie Hancock" }]
                }
              ]
            }
          };
        }

        if (query.includes("Grant Green")) {
          return {
            albums: {
              items: [
                {
                  id: "album-green-street",
                  name: "Green Street",
                  release_date: "1961-01-01",
                  images: [{ url: "https://i.scdn.co/image/green-street" }],
                  external_urls: { spotify: "https://open.spotify.com/album/album-green-street" },
                  artists: [{ id: "artist-grant", name: "Grant Green" }]
                }
              ]
            }
          };
        }

        if (query.includes("Return to Forever")) {
          return {
            albums: {
              items: [
                {
                  id: "album-romantic-warrior-search",
                  name: "Romantic Warrior",
                  release_date: "1976-01-01",
                  images: [{ url: "https://i.scdn.co/image/romantic-warrior-search" }],
                  external_urls: { spotify: "https://open.spotify.com/album/album-romantic-warrior-search" },
                  artists: [{ id: "artist-rtf", name: "Return to Forever" }]
                }
              ]
            }
          };
        }

        if (query.includes("Pat Metheny")) {
          return {
            albums: {
              items: [
                {
                  id: "album-beyond-missouri-sky",
                  name: "Beyond the Missouri Sky",
                  release_date: "1997-01-01",
                  images: [{ url: "https://i.scdn.co/image/beyond-missouri-sky" }],
                  external_urls: { spotify: "https://open.spotify.com/album/album-beyond-missouri-sky" },
                  artists: [{ id: "artist-pat", name: "Pat Metheny" }]
                }
              ]
            }
          };
        }

        return { albums: { items: [] } };
      }

      throw new Error(`Unexpected path ${path}`);
    });

    const { POST } = await import("@/app/api/jazz/recommendations/route");
    const request = new NextRequest("https://vanguard.noesis.studio/api/jazz/recommendations", {
      method: "POST",
      body: JSON.stringify({
        requests: ["Classic", "Exploratory", "Fusion", "Late Night", "Focus"].map((vibe) => ({
          vibe,
          excludeIds: [],
          rotation: 0,
          seed: 7,
          limit: 5
        }))
      })
    });
    const response = await POST(request);
    const payload = await response.json();
    const feeds = ensureUniqueFeeds(payload.feeds, { seed: 7, priorityVibe: "Classic" });
    const allIds = Object.values(feeds).flatMap((feed) => feed?.picks.map((pick) => pick.id) ?? []);

    expect(new Set(allIds).size).toBe(25);
    for (const vibe of ["Classic", "Exploratory", "Fusion", "Late Night", "Focus"] as const) {
      expect(feeds[vibe]?.picks).toHaveLength(5);
      expect(feeds[vibe]?.picks.some((pick) => pick.source === "spotify")).toBe(true);
    }
  });
});
