import { deflateSync } from "node:zlib";
import { createHash } from "node:crypto";

// Generated raster fixture only; never imported into production content.
export function syntheticReviewImage(width = 320, height = 180) {
  const crc32 = bytes => {
    let crc = 0xffffffff;
    for (const b of bytes) { crc ^= b; for (let n = 0; n < 8; n++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); }
    return (crc ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const b = Buffer.alloc(data.length + 12); b.writeUInt32BE(data.length); b.write(type, 4, "ascii"); data.copy(b, 8);
    b.writeUInt32BE(crc32(b.subarray(4, -4)), b.length - 4); return b;
  };
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 2;
  const pixels = Buffer.alloc((width * 3 + 1) * height, 65);
  for (let row = 0; row < height; row++) pixels[row * (width * 3 + 1)] = 0;
  const png = Buffer.concat([Buffer.from("89504e470d0a1a0a", "hex"), chunk("IHDR", header), chunk("IDAT", deflateSync(pixels)), chunk("IEND", Buffer.alloc(0))]);
  return { url: "/assets/editorial/" + createHash("sha256").update(png).digest("hex") + ".png", alt: "Synthetic raster test only",
    attribution: "Synthetic local test fixture, not production content", source_url: "https://example.invalid/synthetic-fixture", upload_png: png.toString("base64") };
}
