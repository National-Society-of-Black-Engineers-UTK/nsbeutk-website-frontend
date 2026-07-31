import { ImageResponse } from "next/og";

export const alt = "NSBE UTK — National Society of Black Engineers, UT Knoxville";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#173345",
          padding: "80px",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, color: "#ffffff" }}>NSBE UTK</div>
        <div style={{ marginTop: 24, fontSize: 32, color: "#ffcf40", fontWeight: 700 }}>
          National Society of Black Engineers — UT Knoxville
        </div>
      </div>
    ),
    { ...size }
  );
}
