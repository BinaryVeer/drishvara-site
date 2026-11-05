import { createHash } from "node:crypto";
import { inflateSync } from "node:zlib";

// Preview only the saved copy, never a caller-supplied URL. No credentials leave this server.
export async function loadEditorialReviewImage(media, { origin, fetcher = fetch } = {}) {
  const unavailable = () => { throw Error("editorial_media_unavailable"); };
  const upload = reviewedImageUpload(media);
  if (upload) return { bytes: Buffer.from(upload.base64, "base64"), contentType: "image/png" };
  let url;
  try {
    const raw = media?.url;
    if (typeof raw !== "string" || raw.length > 2500) unavailable();
    url = new URL(raw, origin);
    const localAsset = url.origin === origin && /^\/assets\/[a-zA-Z0-9_./-]+$/.test(url.pathname) && !raw.includes("..") && !url.search;
    const commons = url.protocol === "https:" && url.hostname === "upload.wikimedia.org" && !url.port && url.pathname.startsWith("/wikipedia/commons/");
    if ((!localAsset && !commons) || url.username || url.password || url.hash || /%2f|%5c|%2e/i.test(url.pathname)) unavailable();
  } catch { unavailable(); }
  const limit = 5 * 1024 * 1024;
  const response = await fetcher(url, { method: "GET", redirect: "error", credentials: "omit", signal: AbortSignal.timeout(10000),
    headers: { Accept: "image/png,image/jpeg,image/webp", "User-Agent": "Drishvara-Private-Media-Review/1.0" } });
  const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (!response.ok || !["image/png", "image/jpeg", "image/webp"].includes(contentType) || Number(response.headers.get("content-length") || 0) > limit) unavailable();
  const reader = response.body?.getReader();
  if (!reader) unavailable();
  const chunks = []; let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); unavailable(); }
      chunks.push(Buffer.from(value));
    }
  } finally { reader.releaseLock(); }
  const bytes = Buffer.concat(chunks);
  const matchesType = contentType === "image/png" ? bytes.subarray(0, 8).toString("hex") === "89504e470d0a1a0a" :
    contentType === "image/jpeg" ? bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 :
    bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
  if (!matchesType) unavailable();
  return { bytes, contentType };
}

// Uploads remain inside the private immutable copy until approved Article delivery.
export function reviewedImageUpload(media) {
  if (!Object.hasOwn(media ?? {}, "upload_png")) return null;
  const fail = () => { throw Error("invalid_editorial_image"); };
  if (!media || Object.keys(media).sort().join(",") !== "alt,attribution,source_url,upload_png,url" ||
      typeof media.upload_png !== "string" || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(media.upload_png)) fail();
  const bytes = Buffer.from(media.upload_png, "base64");
  if (bytes.length < 45 || bytes.length > 98304 || bytes.toString("base64") !== media.upload_png ||
      bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a" || bytes.readUInt32BE(8) !== 13 ||
      bytes.subarray(12, 16).toString("ascii") !== "IHDR" || bytes.subarray(-8, -4).toString("ascii") !== "IEND") fail();
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20), ratio = width / height;
  if (width < 320 || width > 2400 || height < 180 || height > 1800 ||
      ![16 / 9, 4 / 3].some(r => Math.abs(ratio - r) < 0.015)) fail();
  // Bound decompression and verify chunk CRCs; a forged PNG header is not an image.
  const bits = bytes[24], colour = bytes[25], channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colour];
  const allowedBits = colour === 0 ? [1, 2, 4, 8, 16] : colour === 3 ? [1, 2, 4, 8] : [8, 16];
  if (!channels || !allowedBits.includes(bits) || bytes[26] || bytes[27] || bytes[28]) fail();
  const compressed = [];
  let offset = 8, headers = 0;
  while (offset < bytes.length) {
    if (offset + 12 > bytes.length) fail();
    const length = bytes.readUInt32BE(offset), end = offset + length + 12;
    if (end > bytes.length) fail();
    const type = bytes.subarray(offset + 4, offset + 8).toString("ascii");
    let crc = 0xffffffff;
    for (const b of bytes.subarray(offset + 4, end - 4)) { crc ^= b; for (let n = 0; n < 8; n++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); }
    if (((crc ^ 0xffffffff) >>> 0) !== bytes.readUInt32BE(end - 4)) fail();
    if (type === "IHDR") headers++;
    if (type === "IDAT") compressed.push(bytes.subarray(offset + 8, end - 4));
    if (type === "IEND" && (length !== 0 || end !== bytes.length)) fail();
    if (["acTL", "fcTL", "fdAT"].includes(type)) fail();
    offset = end;
  }
  if (headers !== 1 || !compressed.length) fail();
  const rowBytes = Math.ceil(width * channels * bits / 8) + 1, expected = rowBytes * height;
  let pixels;
  try { pixels = inflateSync(Buffer.concat(compressed), { maxOutputLength: expected }); } catch { fail(); }
  if (pixels.length !== expected) fail();
  for (let row = 0; row < height; row++) if (pixels[row * rowBytes] > 4) fail();
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (media.url !== "/assets/editorial/" + digest + ".png" ||
      ![media.alt, media.attribution].every(v => typeof v === "string" && v.trim() && v.length <= 2000)) fail();
  let source;
  try { source = new URL(media.source_url); } catch { fail(); }
  if (source.protocol !== "https:" || source.username || source.password) fail();
  return { path: media.url.slice(1), base64: media.upload_png, width, height };
}
