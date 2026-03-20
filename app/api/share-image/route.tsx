import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";
/* eslint-disable @next/next/no-img-element */

function getParam(request: NextRequest, key: string, fallback: string) {
  return request.nextUrl.searchParams.get(key)?.trim() || fallback;
}

export async function GET(request: NextRequest) {
  const title = getParam(request, "title", "Today’s Jazz Pick");
  const artist = getParam(request, "artist", "jazz-your-life");
  const reason = getParam(request, "reason", "留一張值得聽完的專輯給今天。");
  const imageUrl = getParam(request, "imageUrl", "");
  const accentColor = getParam(request, "accentColor", "#c8a46c");
  const subgenre = getParam(request, "subgenre", "Jazz");
  const year = getParam(request, "year", "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #0d1412 0%, #17231f 55%, #0b100f 100%)",
          color: "#f4efdf",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Georgia, serif"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: "9999px",
            background: accentColor,
            opacity: 0.18
          }}
        />
        <div
          style={{
            display: "flex",
            width: "100%",
            padding: "52px",
            gap: "36px",
            alignItems: "stretch"
          }}
        >
          <div
            style={{
              width: 430,
              height: 430,
              borderRadius: 32,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "#111"
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                width={430}
                height={430}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #1c2623 0%, #24342f 100%)",
                  color: "#d7d1c3",
                  fontSize: 42
                }}
              >
                jazz-your-life
              </div>
            )}
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              paddingTop: 8,
              paddingBottom: 8
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                style={{
                  fontSize: 22,
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  color: "rgba(244,239,223,0.68)"
                }}
              >
                jazz-your-life
              </div>
              <div style={{ fontSize: 72, lineHeight: 1.02 }}>{title}</div>
              <div
                style={{
                  fontSize: 30,
                  color: "rgba(244,239,223,0.8)"
                }}
              >
                {artist}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  marginTop: 6
                }}
              >
                <div
                  style={{
                    borderRadius: 9999,
                    padding: "8px 16px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    fontSize: 18,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(244,239,223,0.72)"
                  }}
                >
                  {subgenre}
                </div>
                {year ? (
                  <div
                    style={{
                      borderRadius: 9999,
                      padding: "8px 16px",
                      border: "1px solid rgba(255,255,255,0.12)",
                      fontSize: 18,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "rgba(244,239,223,0.72)"
                    }}
                  >
                    {year}
                  </div>
                ) : null}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
                padding: "28px 30px",
                borderRadius: 28,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)"
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "rgba(244,239,223,0.6)"
                }}
              >
                今日推薦
              </div>
              <div
                style={{
                  fontSize: 34,
                  lineHeight: 1.4,
                  color: "#f4efdf"
                }}
              >
                {reason}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}
