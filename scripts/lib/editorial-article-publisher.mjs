import { snapshotHash, canonicalPublicationDate } from "./ag70d-word-selection-engine.mjs";
import { prepareReviewedArticleFiles } from "../../services/pipeline/publish-all-core.js";
import { reviewedImageUpload } from "./editorial-review-media.mjs";

// One fast-forward commit owns the page, discovery index and recovery receipt together.
export function createEditorialArticlePublisher({ env = {}, fetcher = fetch } = {}) {
  return async ({ job, timestamp, revalidate }) => {
    const { EDITORIAL_GITHUB_OWNER: owner, EDITORIAL_GITHUB_REPO: repo,
      EDITORIAL_GITHUB_BRANCH: branch, EDITORIAL_GITHUB_TOKEN: token } = env;
    if (!token || owner !== "BinaryVeer" || repo !== "drishvara-site" || branch !== "main") throw Error("article_publisher_unavailable");
    const folder = { world_affairs: "world", media_society: "media", public_programmes: "policy", sports: "sports", spirituality: "spiritual" }[job?.version?.payload?.desk];
    if (!folder || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(job?.candidate_id || "")) throw Error("article_copy_incomplete");
    const expectedPath = "articles/" + folder + "/editorial-" + job.candidate_id + ".html";
    const base = `https://api.github.com/repos/${owner}/${repo}/`;
    const request = async (path, options = {}, missing = false) => {
      const response = await fetcher(base + path, { ...options, redirect: "error", signal: AbortSignal.timeout(15000),
        headers: { Accept: "application/vnd.github+json", Authorization: "Bearer " + token, "X-GitHub-Api-Version": "2026-03-10", "Content-Type": "application/json" } });
      if (missing && response.status === 404) return null;
      if (!response.ok) throw Error(response.status === 409 || response.status === 422 ? "article_branch_advanced" : "article_publisher_unavailable");
      return response.json();
    };
    const refPath = "git/refs/heads/main";
    const head = (await request("git/ref/heads/main")).object.sha;
    const read = async path => {
      const file = await request("contents/" + path + "?ref=" + encodeURIComponent(head), {}, true);
      if (file === null) return null;
      if (file.type !== "file" || file.encoding !== "base64" || typeof file.content !== "string") throw Error("article_destination_conflict");
      return Buffer.from(file.content, "base64").toString("utf8");
    };
    const receiptPath = "data/editorial-release-receipts/" + job.candidate_id + ".json";
    const priorText = await read(receiptPath), prior = priorText === null ? null : JSON.parse(priorText);
    if (prior && (prior.candidate_id !== job.candidate_id || prior.article_path !== expectedPath || !/^sha256:[a-f0-9]{64}$/.test(prior.article_hash || ""))) throw Error("article_destination_conflict");
    const publicBinding = { candidate_id: job.candidate_id, version_id: job.version_id, content_hash: job.content_hash };
    const bindingHash = snapshotHash(publicBinding);
    if (prior?.binding_hash === bindingHash) {
      await revalidate();
      const priorArticle = await read(prior.article_path);
      if (!priorArticle || snapshotHash(priorArticle) !== prior.article_hash) throw Error("article_destination_conflict");
      return { status: "article_committed", reference: head, path: prior.article_path };
    }
    if (prior && prior.candidate_id !== job.candidate_id) throw Error("article_destination_conflict");
    const indexText = await read("data/article-index.json");
    if (indexText === null) throw Error("article_copy_incomplete");
    const files = await prepareReviewedArticleFiles({ candidateId: job.candidate_id, version: job.version,
      date: canonicalPublicationDate(timestamp), timestamp, existingIndex: JSON.parse(indexText) });
    const oldArticle = await read(files.articlePath);
    if (oldArticle !== null && (!prior || prior.article_path !== files.articlePath || snapshotHash(oldArticle) !== prior.article_hash)) throw Error("article_destination_conflict");
    const receipt = { ...publicBinding, binding_hash: bindingHash, article_path: files.articlePath, article_hash: snapshotHash(files.html) };
    const image = reviewedImageUpload(job.version.payload.media[0]);
    const imageEntries = [];
    if (image) {
      // Content-addressed assets cannot overwrite another reviewed image or execute HTML/SVG.
      const blob = await request("git/blobs", { method: "POST", body: JSON.stringify({ content: image.base64, encoding: "base64" }) });
      if (!/^[a-f0-9]{40}$/.test(blob.sha || "")) throw Error("article_publisher_unavailable");
      imageEntries.push({ path: image.path, mode: "100644", type: "blob", sha: blob.sha });
    }
    const parent = await request("git/commits/" + head);
    const tree = await request("git/trees", { method: "POST", body: JSON.stringify({ base_tree: parent.tree.sha, tree: [
      { path: files.articlePath, mode: "100644", type: "blob", content: files.html },
      { path: files.indexPath, mode: "100644", type: "blob", content: JSON.stringify(files.index, null, 2) + "\n" },
      { path: receiptPath, mode: "100644", type: "blob", content: JSON.stringify(receipt, null, 2) + "\n" }, ...imageEntries
    ] }) });
    const commit = await request("git/commits", { method: "POST", body: JSON.stringify({ message: "Publish reviewed editorial copy " + bindingHash, tree: tree.sha, parents: [head] }) });
    await revalidate();
    await request(refPath, { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: false }) });
    return { status: "article_committed", reference: commit.sha, path: files.articlePath };
  };
}
