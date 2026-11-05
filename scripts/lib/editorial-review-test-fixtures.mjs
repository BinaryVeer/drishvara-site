import { deflateSync } from "node:zlib";
import { createHash } from "node:crypto";
import { ARTICLE_EDITORIAL_REVIEW } from "./editorial-article-qualification.mjs";

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

export function syntheticArticleLayout() {
  const common = (id, type, after_paragraph) => ({ id, type, after_paragraph, width: "reading", title: "Synthetic " + id,
    caption: "Synthetic illustration and data for testing only; not an observed statistic.", source_refs: [1] });
  return { desk: "world_affairs", body: Array.from({ length: 6 }, (_, i) => "Synthetic paragraph " + (i + 1) + ". " + "Test content only. ".repeat(90)).join("\n\n"),
    sources: [{ url: "https://example.invalid/synthetic-fixture", title: "Synthetic evidence fixture" }],
    media: [syntheticReviewImage(), syntheticReviewImage(400, 300)], research_refs: ["synthetic-layout-test-only"],
    layout: { contract_version: "drishvara.article-layout.v1", sections: [{ heading: "Synthetic section heading", before_paragraph: 2 }], objects: [
      { ...common("hero", "image", 0), width: "wide", media_index: 0, visual_kind: "photograph" },
      { ...common("diagram", "image", 2), media_index: 1, visual_kind: "diagram" },
      { ...common("table", "table", 3), columns: ["Measure", "Value"], rows: [["Test A", "2"], ["Test B", "4"]] },
      { ...common("chart", "bar_chart", 4), unit: "Synthetic units", labels: ["Test A", "Test B"], values: [2, 4] },
      { ...common("takeaways", "takeaways", 5), items: ["Synthetic takeaway, not editorial content."] }
    ] } };
}

export function syntheticQualifiedArticle() {
  const p = syntheticArticleLayout();
  p.sources.push({ url: "https://example.invalid/second-evidence", title: "Second synthetic evidence fixture" });
  p.media = [{ url: "https://example.invalid/synthetic-review-image.png", alt: "Synthetic proposed image only",
    attribution: "Synthetic fixture, no actual content approval", source_url: "https://example.invalid/image-source" }];
  p.layout.sections = [{ heading: "Synthetic context", before_paragraph: 1 }, { heading: "Synthetic analysis", before_paragraph: 3 },
    { heading: "Synthetic conclusion", before_paragraph: 6 }];
  p.layout.objects = [{ id: "hero", type: "image", after_paragraph: 0, width: "wide", title: "Synthetic hero",
    caption: "Synthetic test only", source_refs: [1], media_index: 0, visual_kind: "photograph" },
    { id: "takeaways", type: "takeaways", after_paragraph: 6, width: "reading", title: "Synthetic takeaways", caption: "Synthetic test only",
      source_refs: [1, 2], items: ["Synthetic first point", "Synthetic second point", "Synthetic third point"] }];
  return p;
}

export function syntheticArticleQualityDecision(version, id) {
  return { id, scope: "editorial", decision: "approve", version_id: version.id, content_hash: version.content_hash,
    note: JSON.stringify({ contract_version: ARTICLE_EDITORIAL_REVIEW, rationale: "Synthetic human-decision simulation, not an actual review.",
      quality_score: 85, visitor_value_score: 80 }) };
}
