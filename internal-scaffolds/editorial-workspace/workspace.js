/* Generic shell only. All drafts, grants and decisions come from the authenticated service. */
(() => {
  "use strict";
  const endpoint = "/api/editorial-workspace";
  const $ = id => document.getElementById(id);
  let session = null, selected = null, items = [], loadSequence = 0, queueSequence = 0, nextCursor = null, view = "review", person = null;
  const node = (tag, text, cls) => { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; };
  const message = text => { $("message").textContent = text; };
  async function request(action, body) {
    const response = await fetch(endpoint + "?action=" + action, {
      method: body === undefined ? "GET" : "POST", credentials: "same-origin", cache: "no-store",
      ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      const error = new Error(Array.isArray(data.details) && data.details.length ? data.details.join(" ") : data.code || "editorial_request_denied");
      error.result = data; throw error;
    }
    return data;
  }
  const command = body => request("command", body);
  const granted = (kind, scope) => session?.capabilities?.some(g => g.kind === kind && g.scope === scope);
  const labels = { review: "Review Queue", acceptance: "Acceptance Queue", publishing: "Publishing Queue", delivery: "Delivery Queue", live: "Live Repository" };
  const stages = { review: "Editor review", corrections: "Returned to Editor", acceptance: "Publisher acceptance", publishing: "Publisher release", delivery: "Deployment pending", daily_queue: "Daily publication queue", live: "Published", rejected: "Rejected", blocked: "State unavailable" };
  const friendly = code => ({ workspace_administrator_required: "Admin access is required.",
    active_confirmed_account_required: "No active, email-confirmed Drishvara account was found.",
    verified_qualification_reference_required: "Verified qualification evidence is required for this responsibility.",
    explicit_admin_self_review_required: "An explicit Admin exception and reason are required.",
    explicit_admin_subject_review_required: "A separate Admin subject-review acknowledgment and reason are required.",
    word_registration_sources_pending: "Source-use metadata is still pending. The rights decision must cite each source ID and its actual clearance reference. Correct the copy, then review its new version.",
    word_registration_metadata_pending: "Complete the reviewed lexical identity, lemma, equivalence, context and no-etymology confirmation.",
    word_registration_copy_unapproved: "The exact public copy does not yet satisfy the existing AG70E approval contract.",
    word_reference_unapproved: "A required registry authority is missing, revoked or conflicts with an immutable existing reference.",
    approved_word_registration_pending: "Approved-bank registration is still pending or invalidated. Complete the source-use checks and register the exact reviewed Word first.",
    self_review_denied: "This account contributed to the copy and cannot independently review it.",
    reviewer_session_required: "Your session has expired. Please sign in again.",
    editorial_assignment_required: "A current candidate assignment is required.",
    invalid_review_decision: "Check the rationale and evidence references. Approval needs at least one unique, actual evidence reference.",
    editorial_reviews_pending: "Required reviews are still pending.", delivery_not_activated: "Controlled delivery has not been activated.",
    editorial_review_handoff_pending: "Complete the editorial checklist and outstanding corrections before Publisher acceptance.",
    workflow_state_unavailable: "Queue state could not be verified. No stage or approval was changed.",
    reviewed_feedback_pending: "Learning feedback requires a resolved correction and complete current-copy reviews.",
    article_long_form_length_pending: "The Article does not meet the existing long-form word-count standard. Submit a corrected version before release.",
    article_sources_pending: "The Article requires two to five distinct HTTPS source references and the corresponding factual and source-use reviews.",
    article_outline_pending: "The Article requires at least three positioned sections.",
    article_quality_review_pending: "An effective editorial decision with recorded quality and visitor-value scores is required for this exact copy.",
    article_quality_threshold_pending: "The recorded scores do not meet the existing quality and visitor-value thresholds.",
    invalid_article_intake_batch: "Choose a valid prepared Article batch with one to five distinct desks and unchanged intake command IDs.",
    article_intake_reconciliation_required: "Import stopped. Some copies may already be saved. Retry the same file without changing its command IDs.",
    invalid_article_layout: "Check object titles, captions, sources, image references and paragraph positions. The changed copy needs a valid complete layout.",
    article_layout_required: "Multiple images require explicit placement in the Article layout.",
    article_visual_enrichment_pending: "Add one primary hero and at least one sourced enrichment object before release. This does not grant content approval.",
    delivery_readiness_unavailable: "The database delivery-readiness check is unavailable. Delivery remains disabled.",
    release_scope_denied: "A current release permission and candidate assignment are required.",
    queued_delivery_disabled: "Release request saved. Delivery is disabled; nothing was published.",
    queued_worker_unavailable: "Release request saved. The trusted delivery worker is unavailable.",
    delivery_in_progress: "Delivery is already in progress. Refresh before retrying.",
    delivery_completed: "Controlled delivery completed. See the recorded delivery result.",
    invalid_review_checklist: "Select the aspects you actually reviewed. Publisher acceptance is a separate step.",
    invalid_editorial_image: "Use a PNG image up to 96 KiB, 16:9 or 4:3, with alt text, attribution and its source URL.",
    invalid_revision_request: "Enter correction instructions of 12-6,000 characters and valid, unique evidence references.",
    revision_task_unavailable: "This correction request is unavailable or not assigned to your account.",
    revision_task_closed: "This correction request is already resolved. Refresh to see its saved outcome.",
    revision_task_limit: "Resolve or withdraw existing correction requests before opening more.",
    revision_cancel_denied: "Only the requester or Admin can withdraw this correction request.",
    revision_comparison_required: "Review the before/after comparison and acknowledge the exact revised copy.",
    revision_unchanged: "No copy changes were made. The correction request remains open.",
    editorial_corrections_pending: "A saved correction request is unresolved. Complete or explicitly withdraw it before release.",
    word_workflow_unavailable: "The approved daily Word workflow is not available.",
    delivery_pending: "Release request saved, but delivery is pending. Nothing is being reported as published." }[code] || code);
  async function busy(button, work) {
    message("");
    button.disabled = true;
    try { await work(); } catch (error) { message(friendly(error.message)); } finally { button.disabled = false; }
  }
  const login = $("login-form");
  if (login) {
    login.addEventListener("submit", event => {
      event.preventDefault();
      busy(login.querySelector("button"), async () => {
        const data = new FormData(login);
        try { await request("login", { email: data.get("email"), password: data.get("password") }); }
        finally { login.elements.password.value = ""; }
        location.assign(endpoint);
      });
    });
    return;
  }
  function renderQueue() {
    const filtered = items.filter(item => $("kind-filter").value === "all" || item.kind === $("kind-filter").value);
    $("queue").replaceChildren(...filtered.map(item => {
      const b = node("button", item.title, "candidate"); b.type = "button"; b.setAttribute("aria-pressed", String(item.id === selected?.candidate.id));
      b.append(node("small", item.kind + " / " + (stages[item.workflow.stage] || "State unavailable")));
      b.addEventListener("click", () => busy(b, () => open(item.id))); return b;
    }));
    $("empty").hidden = filtered.length !== 0;
  }
  function clearSelection() {
    loadSequence++; selected = null;
    $("document").replaceChildren(node("h2", "Select a candidate"));
    $("review").replaceChildren(node("h2", labels[view] || "Review"));
  }
  async function refresh(append = false) {
    loadSequence++;
    const seq = ++queueSequence, activeView = view;
    const query = { view: view === "live" ? "live" : $("queue-scope").value === "all" ? "all" : view,
      kind: $("kind-filter").value, desk: $("desk-filter").value, after_id: append ? nextCursor : null };
    const data = await request("workflow", query);
    if (seq !== queueSequence || view !== activeView) return;
    if (append) { const byId = new Map(items.map(i => [i.id, i])); for (const i of data.items) byId.set(i.id, i); items = [...byId.values()]; }
    else items = data.items;
    nextCursor = data.next_cursor; $("queue-more").hidden = !nextCursor;
    $("queue-scope").closest("label").hidden = view === "live";
    $("empty").textContent = nextCursor ? "No matching records on this page. More records are available." : "No assigned candidates pending here.";
    if (selected && !items.some(i => i.id === selected.candidate.id)) {
      $("handoff-status").textContent = selected.version.title + " is no longer pending in this queue. Its saved version and history are retained.";
      clearSelection();
    } else $("handoff-status").textContent = "";
    renderQueue(); if (selected) await open(selected.candidate.id);
  }
  function detail(parent, title, value) {
    if (typeof value !== "string" || !value) return;
    const section = node("section", undefined, "content-section"); section.append(node("h3", title), node("p", value, "copy")); parent.append(section);
  }
  function renderArticleMedia(parent, data, mediaIndex = 0) {
    const section = node("section", undefined, "article-media-review"); section.append(node("h3", "Proposed Article image"));
    const media = data.version.payload.media?.[mediaIndex];
    if (!media) { section.append(node("p", "No primary image attached. Visual review pending.", "status")); parent.append(section); return; }
    const image = node("img"); image.alt = media.alt || "Proposed image - description pending";
    image.className = "article-review-image"; image.decoding = "async"; image.loading = "lazy";
    image.referrerPolicy = "no-referrer";
    const params = new URLSearchParams({ action: "media", candidate_id: data.candidate.id, version_id: data.version.id, content_hash: data.version.content_hash, media_index: mediaIndex });
    const status = node("p", "Image preview loading. Relevance and source-use are not automatically approved.", "status"); status.setAttribute("role", "status");
    image.addEventListener("load", () => { status.textContent = image.naturalWidth + " x " + image.naturalHeight + " - proposed image; review required."; });
    image.addEventListener("error", () => { image.hidden = true; status.textContent = "Image preview unavailable. Check the saved source or replace the image; media approval remains pending."; });
    image.src = endpoint + "?" + params;
    const figure = node("figure"); figure.append(image, node("figcaption", media.attribution || "Attribution missing")); section.append(figure, status);
    try {
      const source = new URL(media.source_url);
      if (source.protocol === "https:" && !source.username && !source.password) {
        const link = node("a", "Inspect image source and reuse terms"); link.href = source.href; link.target = "_blank"; link.rel = "noopener noreferrer"; section.append(link);
      }
    } catch { section.append(node("p", "Source URL missing or invalid.", "status")); }
    parent.append(section);
  }
  function articleLayoutEditor(form, payload, data) {
    const area = node("section", undefined, "article-layout-editor"); area.append(node("h3", "Article layout & visual objects")); form.append(area);
    const paragraphs = () => payload.body.trim().split(/\n\s*\n/).filter(Boolean).length;
    const count = node("p", paragraphs() + " body paragraphs. Positions are checked again when saving.", "muted"); area.append(count);
    const images = [], objects = [], headings = [], urls = new Set(); let pending = 0;
    const input = (parent, label, value, name, type = "text") => {
      const el = field(parent, label, node(type === "textarea" ? "textarea" : "input"));
      if (type !== "textarea") el.type = type;
      el.value = value ?? ""; if (name) el.name = name; return el;
    };
    const select = (parent, label, values, value) => {
      const el = field(parent, label, node("select")); el.setAttribute("aria-label", label);
      for (const [v, t] of values) el.append(new Option(t, v)); el.value = value; return el;
    };
    const refs = payload.sources.map((s, i) => (i + 1) + ": " + (s.title || s.url || s)).join("\n");
    area.append(node("p", "Source numbers (update these if the source list changes):\n" + refs, "copy"));
    const common = (box, old = {}, hero = false) => ({
      position: input(box, "Place after body paragraph (0 = hero)", old.after_paragraph ?? (hero ? 0 : 1), null, "number"),
      width: select(box, "Display width", [["reading", "Reading column"], ["wide", "Wide visual"]], old.width || "reading"),
      title: input(box, "Object title", old.title || "", null),
      caption: input(box, "Caption / context", old.caption || "", null, "textarea"),
      sources: input(box, "Source numbers, comma separated", old.source_refs?.join(", ") || "", null)
    });
    function addImage(media = {}, old = {}, originalIndex = null) {
      if (images.filter(i => !i.removed).length >= 8) { message("An Article supports up to eight images."); return; }
      const box = node("fieldset", undefined, "image-correction"); box.append(node("legend", "Image " + (images.length + 1))); area.append(box);
      const first = images.length === 0, state = { box, removed: false, upload: media.upload_png ?? null };
      if (originalIndex !== null) renderArticleMedia(box, data, originalIndex);
      state.mode = select(box, "Change the current picture?", [["keep", "No - keep existing image"], ["replace", "Yes - replace or add"], ["remove", "Remove image"]], originalIndex === null ? "replace" : "keep");
      if (first) state.mode.name = "image_change";
      state.common = common(box, old, images.length === 0);
      state.kind = select(box, "Visual type", [["photograph", "Photograph"], ["infographic", "Infographic"], ["diagram", "Diagram"], ["chart", "Chart image"], ["map", "Map"]], old.visual_kind || "photograph");
      const controls = node("div"); box.append(controls);
      const ratio = select(controls, "Upload ratio", [["wide", "16:9 - wide image"], ["standard", "4:3 - editorial image"]], "wide");
      if (first) ratio.name = "image_ratio";
      const file = field(controls, "Upload PNG (up to 96 KiB; total request up to 240 KB)", node("input")); file.type = "file"; file.accept = "image/png"; if (first) file.name = "image_file";
      const preview = node("img"); preview.alt = "Private image preview"; preview.hidden = true; preview.className = "private-image-preview"; controls.append(preview);
      state.inputs = {};
      for (const [key, label] of [["url", "Existing image URL or uploaded asset path"], ["alt", "Alternative text"], ["attribution", "Image attribution and use basis"], ["source_url", "Image source URL"]]) {
        state.inputs[key] = input(controls, label, media[key], first ? "image_" + key : null);
      }
      const status = node("p"); status.setAttribute("role", "status"); controls.append(status);
      function syncMode() { controls.hidden = state.mode.value !== "replace"; state.removed = state.mode.value === "remove"; }
      state.mode.addEventListener("change", syncMode); syncMode();
      file.addEventListener("change", async () => {
        pending++; state.upload = null; file.setCustomValidity(""); preview.hidden = true; state.inputs.url.readOnly = false;
        try {
          if (!file.files.length) return;
          const chosen = file.files[0]; if (chosen.type !== "image/png" || chosen.size > 98304) throw Error("Use a PNG up to 96 KiB.");
          const bytes = await chosen.arrayBuffer(), bitmap = await createImageBitmap(chosen), w = bitmap.width, h = bitmap.height; bitmap.close();
          const r = ratio.value === "wide" ? 16 / 9 : 4 / 3;
          if (w < 320 || w > 2400 || h < 180 || h > 1800 || Math.abs(w / h - r) >= .015) throw Error("Use the selected ratio, width 320-2400px and height 180-1800px.");
          const digest = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map(b => b.toString(16).padStart(2, "0")).join("");
          state.upload = btoa([...new Uint8Array(bytes)].map(b => String.fromCharCode(b)).join("")); state.inputs.url.value = "/assets/editorial/" + digest + ".png"; state.inputs.url.readOnly = true;
          if (state.previewUrl) { URL.revokeObjectURL(state.previewUrl); urls.delete(state.previewUrl); }
          state.previewUrl = URL.createObjectURL(chosen); urls.add(state.previewUrl); preview.src = state.previewUrl; preview.hidden = false;
          status.textContent = w + " x " + h + " - private pending-copy image";
        } catch (error) { status.textContent = error.message; file.setCustomValidity(error.message); }
        finally { pending--; }
      });
      ratio.addEventListener("change", () => { if (file.files.length) file.dispatchEvent(new Event("change")); });
      images.push(state);
    }
    const oldLayout = payload.layout;
    for (let i = 0; i < payload.media.length; i++) addImage(payload.media[i], oldLayout?.objects.find(o => o.type === "image" && o.media_index === i), i);
    if (!payload.media.length) { addImage(); images[0].mode.value = "remove"; images[0].mode.dispatchEvent(new Event("change")); }
    const addPicture = node("button", "Add image / infographic"); addPicture.type = "button"; area.append(addPicture);
    addPicture.addEventListener("click", () => { addImage(); form.dispatchEvent(new Event("change")); });
    function addObject(old = {}) {
      if (objects.filter(o => !o.removed.checked).length >= 8) { message("Use up to eight structured objects."); return; }
      const box = node("fieldset"); box.append(node("legend", "Structured enrichment")); area.append(box);
      const type = select(box, "Object type", [["takeaways", "Key takeaways"], ["table", "Comparison / data table"], ["bar_chart", "Bar chart with data table"]], old.type || "takeaways");
      const fields = common(box, old), removed = field(box, "Remove this object", node("input")); removed.type = "checkbox";
      const items = input(box, "Takeaways: one per line", old.items?.join("\n"), null, "textarea");
      const columns = input(box, "Table column headings: separate with |", old.columns?.join(" | "));
      const rows = input(box, "Table rows: one per line; cells separated with |", old.rows?.map(r => r.join(" | ")).join("\n"), null, "textarea");
      const unit = input(box, "Chart unit", old.unit);
      const bars = input(box, "Chart data: label | non-negative value, one per line", old.labels?.map((s, i) => s + " | " + old.values[i]).join("\n"), null, "textarea");
      function syncType() { for (const [el, show] of [[items, type.value === "takeaways"], [columns, type.value === "table"], [rows, type.value === "table"], [unit, type.value === "bar_chart"], [bars, type.value === "bar_chart"]]) el.closest("label").hidden = !show; }
      type.addEventListener("change", syncType); syncType(); objects.push({ type, fields, removed, items, columns, rows, unit, bars });
    }
    for (const o of oldLayout?.objects ?? []) if (o.type !== "image") addObject(o);
    const addBlock = node("button", "Add table, chart or takeaways"); addBlock.type = "button"; area.append(addBlock);
    addBlock.addEventListener("click", () => { addObject(); form.dispatchEvent(new Event("change")); });
    function addHeading(old = {}) {
      const box = node("fieldset"); box.append(node("legend", "Section heading")); area.append(box);
      const heading = input(box, "Heading", old.heading), before = input(box, "Before body paragraph", old.before_paragraph || 1, null, "number");
      const removed = field(box, "Remove heading", node("input")); removed.type = "checkbox"; headings.push({ heading, before, removed });
    }
    for (const s of oldLayout?.sections ?? []) addHeading(s);
    const addSection = node("button", "Add section heading"); addSection.type = "button"; area.append(addSection);
    addSection.addEventListener("click", () => { addHeading(); form.dispatchEvent(new Event("change")); });
    const number = el => el.value.trim() === "" ? null : Number(el.value);
    const commonValue = (f, id) => ({ id, after_paragraph: number(f.position), width: f.width.value, title: f.title.value.trim(), caption: f.caption.value.trim(),
      source_refs: f.sources.value.split(",").filter(s => s.trim()).map(s => /^\d+$/.test(s.trim()) ? Number(s) : null) });
    return {
      loading: () => pending > 0,
      cleanup: () => { for (const url of urls) URL.revokeObjectURL(url); },
      sync: () => {
        const media = [], blocks = [];
        for (const i of images.filter(i => !i.removed)) {
          blocks.push({ ...commonValue(i.common, "image-" + blocks.length), type: "image", media_index: media.length, visual_kind: i.kind.value });
          media.push({ ...Object.fromEntries(Object.entries(i.inputs).map(([key, el]) => [key, el.value.trim()])), ...(i.upload ? { upload_png: i.upload } : {}) });
        }
        for (const o of objects.filter(o => !o.removed.checked)) {
          const block = { ...commonValue(o.fields, "object-" + blocks.length), type: o.type.value };
          if (block.type === "takeaways") block.items = o.items.value.split("\n").map(s => s.trim()).filter(Boolean);
          if (block.type === "table") { block.columns = o.columns.value.split("|").map(s => s.trim()); block.rows = o.rows.value.split("\n").filter(s => s.trim()).map(s => s.split("|").map(c => c.trim())); }
          if (block.type === "bar_chart") { const values = o.bars.value.split("\n").filter(s => s.trim()).map(s => s.split("|").map(c => c.trim())); block.unit = o.unit.value.trim(); block.labels = values.map(v => v[0]); block.values = values.map(v => v.length === 2 && v[1] !== "" ? Number(v[1]) : null); }
          blocks.push(block);
        }
        payload.media = media;
        // Old single-picture edits retain their contract unless explicit layout fields are supplied.
        if (!oldLayout && blocks.length <= 1 && !headings.length && blocks.every(b => !b.title && !b.caption && !b.source_refs.length)) return;
        payload.layout = { contract_version: "drishvara.article-layout.v1", sections: headings.filter(h => !h.removed.checked).map(h => ({ heading: h.heading.value.trim(), before_paragraph: number(h.before) })), objects: blocks };
        count.textContent = paragraphs() + " body paragraphs.";
      }
    };
  }
  const aspectLabels = { linguistic: "Language, Sanskrit form and meaning", iast: "IAST transliteration",
    rights: "Source and image reuse", editorial: "Public wording and presentation", context: "Context and applicability",
    safety: "Safety and non-prescriptive wording", textual: "Textual references and translations",
    philosophical: "Philosophical interpretation", factual: "Factual accuracy", media: "Image accuracy and attribution" };
  function field(parent, label, input) { const l = node("label", label); l.append(input); parent.append(l); return input; }
  function consolidatedReview(side, data, scopes) {
    const form = node("form", undefined, "review-form consolidated-review");
    const checks = new Map();
    const checklist = node("fieldset"); checklist.append(node("legend", "Verification checklist"));
    for (const scope of scopes) {
      const input = node("input"); input.type = "checkbox"; input.name = "aspect"; input.value = scope;
      const label = node("label", aspectLabels[scope], "checkbox-label"); label.prepend(input); checklist.append(label); checks.set(scope, input);
    }
    form.append(checklist);
    form.append(node("p", "Check only the aspects you personally verified. A bare word needs no copyright permission, but reused passages and images still require source clearance.", "muted"));
    const correction = field(form, "Is a correction required?", node("select")); correction.name = "correction_required"; correction.required = true;
    for (const [v, t] of [["", "Choose"], ["no", "No"], ["yes", "Yes - revise complete copy"]]) correction.append(new Option(t, v));
    const decision = field(form, "Review decision", node("select")); decision.name = "decision";
    for (const [v, t] of [["revise", "Return for revision"], ["approve", "Approve checked aspects"], ["reject", "Reject checked aspects"]]) decision.append(new Option(t, v));
    const note = field(form, "Review findings and rationale", node("textarea")); note.name = "note"; note.maxLength = 6000; note.rows = 3;
    note.placeholder = "What you checked, the evidence used, limitations and your decision.";
    let scores = null;
    if (data.candidate.kind === "article" && checks.has("editorial")) {
      const box = node("fieldset"); box.append(node("legend", "Editorial assessment"));
      const quality = field(box, "Quality score (0–100)", node("input")), value = field(box, "Visitor-value score (0–100)", node("input"));
      quality.name = "quality_score"; value.name = "visitor_value_score";
      for (const input of [quality, value]) { input.type = "number"; input.min = "0"; input.max = "100"; input.step = "1"; }
      form.append(box); scores = { box, quality, value };
    }
    const refs = field(form, "Evidence references, one per line", node("textarea")); refs.name = "evidence_refs"; refs.rows = 3;
    refs.placeholder = "Source ID plus entry/passage locator, clearance record or exact-copy decision reference";
    const picker = node("select"); picker.setAttribute("aria-label", "Existing source reference"); picker.append(new Option("Choose an existing source", ""));
    for (const source of data.version.payload.content?.sources ?? data.version.payload.sources ?? []) {
      const value = source.evidence_ref || source.url || (typeof source === "string" ? source : null);
      if (typeof value === "string" && value.length <= 500) picker.append(new Option(source.title || value, value));
    }
    if (picker.options.length > 1) {
      const add = node("button", "Add source reference"); add.type = "button";
      add.addEventListener("click", () => { const values = refs.value.split("\n").map(v => v.trim()).filter(Boolean); if (picker.value && !values.includes(picker.value)) refs.value = [...values, picker.value].join("\n"); refs.setCustomValidity(""); });
      form.append(picker, add);
    }
    function exceptionBox(title, copy, cls) {
      const box = node("fieldset", undefined, cls); box.append(node("legend", title));
      const ack = node("input"); ack.type = "checkbox";
      const label = node("label", copy, "checkbox-label"); label.prepend(ack); box.append(label);
      const reason = field(box, "Basis and limitations", node("textarea")); reason.minLength = 12; reason.maxLength = 6000;
      form.append(box); return { box, ack, reason };
    }
    const self = data.review_permissions?.self_review_exception_required ? exceptionBox("Admin self-review exception", "Record an audited exception for my own submitted or edited copy.", "self-review-notice") : null;
    const subject = exceptionBox("Admin subject-review exception", "I am personally reviewing these subjects as Admin, without claiming verified specialist credentials.", "subject-review-notice");
    const selectedScopes = () => [...checks].filter(([, input]) => input.checked).map(([name]) => name);
    const needsSubject = () => selectedScopes().some(scope => data.review_permissions?.subject_review_exception_scopes?.includes(scope));
    const submit = node("button", "Submit review", "primary"); submit.type = "submit"; form.append(submit);
    function sync() {
      const revise = correction.value === "yes", needed = needsSubject() && !revise;
      note.required = true; note.minLength = revise ? 12 : 1; refs.required = !revise && decision.value === "approve"; decision.disabled = revise;
      subject.box.hidden = !needed; subject.ack.required = needed; subject.reason.required = needed;
      if (!needed) { subject.ack.checked = false; subject.reason.value = ""; }
      if (self) { self.box.hidden = revise; self.ack.required = !revise; self.reason.required = !revise; }
      submit.textContent = revise ? "Save correction request and edit" : "Submit review";
      if (scores) {
        const needed = !revise && decision.value === "approve" && checks.get("editorial").checked;
        scores.box.hidden = !needed; scores.quality.required = needed; scores.value.required = needed;
        scores.quality.min = String(needed ? data.article_length?.quality_min ?? 85 : 0);
        scores.value.min = String(needed ? data.article_length?.visitor_value_min ?? 80 : 0);
      }
    }
    form.addEventListener("change", sync);
    form.addEventListener("input", () => { note.setCustomValidity(""); refs.setCustomValidity(""); }); sync();
    let pendingCommand = null, revisionCommand = null;
    form.addEventListener("input", () => { pendingCommand = null; revisionCommand = null; });
    form.addEventListener("change", () => { pendingCommand = null; revisionCommand = null; });
    form.addEventListener("submit", event => { event.preventDefault(); busy(submit, async () => {
      const chosen = selectedScopes(), evidence = refs.value.split("\n").map(v => v.trim()).filter(Boolean);
      if (correction.value === "yes") {
        note.setCustomValidity(note.value.trim().length < 12 ? "Describe the correction in at least 12 characters." : "");
        refs.setCustomValidity(evidence.length > 50 || evidence.some(v => v.length > 500) || new Set(evidence).size !== evidence.length ? "Use up to 50 unique references, each at most 500 characters." : "");
        if (!form.reportValidity()) return;
        if (!data.can_edit) { message("An assigned editor or Admin must submit the correction."); return; }
        revisionCommand ??= revisionRequest(data, note.value.trim(), evidence);
        const receipt = await command(revisionCommand);
        await open(data.candidate.id); message("Correction instructions saved. Closing the editor will not delete the request.");
        correctionEditor(data, receipt.task); return;
      }
      if (!chosen.length) { message("Check at least one aspect you actually reviewed."); return; }
      note.setCustomValidity(note.value.trim() ? "" : "Enter the finding and reason for this decision.");
      refs.setCustomValidity(decision.value === "approve" && !evidence.length ? "Approval requires an actual evidence reference." :
        evidence.length > 50 || evidence.some(v => v.length > 500) ? "Use up to 50 references, each at most 500 characters." :
        new Set(evidence).size !== evidence.length ? "Remove duplicate evidence references." : "");
      if (!form.reportValidity()) return;
      const reviewNote = scores && chosen.includes("editorial") && decision.value === "approve" ? JSON.stringify({
        contract_version: "drishvara.article-editorial-review.v1", rationale: note.value.trim(),
        quality_score: Number(scores.quality.value), visitor_value_score: Number(scores.value.value) }) : note.value.trim();
      if (reviewNote.length > 6000) { note.setCustomValidity("Shorten the rationale so the complete review fits 6,000 characters."); form.reportValidity(); return; }
      if (!confirm("Record one review for the checked aspects of this exact copy? Unchecked aspects remain unchanged.")) return;
      pendingCommand ??= { action: "review_batch", command_id: crypto.randomUUID(), candidate_id: data.candidate.id,
        version_id: data.version.id, content_hash: data.version.content_hash, scopes: chosen, decision: decision.value,
        note: reviewNote, evidence_refs: evidence,
        ...(self ? { admin_exception: { policy_ref: session.self_review_policy_ref, reason: self.reason.value.trim(), acknowledged: self.ack.checked } } : {}),
        ...(needsSubject() ? { subject_review_exception: { policy_ref: session.subject_review_policy_ref, reason: subject.reason.value.trim(), acknowledged: subject.ack.checked } } : {}) };
      await command(pendingCommand); await refresh(); message("Review recorded for the checked aspects. Acceptance and publication remain separate.");
    }); });
    side.append(form);
  }
  const revisionRequest = (data, instructions, evidence = []) => ({ action: "request_revision", command_id: crypto.randomUUID(),
    candidate_id: data.candidate.id, version_id: data.version.id, content_hash: data.version.content_hash, instructions, evidence_refs: evidence });
  function requestCorrection(data) {
    const dialog = node("dialog"); dialog.setAttribute("aria-label", "Save correction request");
    const form = node("form"); form.append(node("h2", "Save correction request"));
    const instructions = field(form, "Correction instructions", node("textarea")); instructions.required = true; instructions.minLength = 12; instructions.maxLength = 6000; instructions.rows = 4;
    const refs = field(form, "Evidence references, one per line", node("textarea")); refs.rows = 3;
    const close = node("button", "Cancel"); close.type = "button"; close.addEventListener("click", () => dialog.close());
    const submit = node("button", "Save request and open editor", "primary"); submit.type = "submit"; form.append(close, submit);
    let pending = null; form.addEventListener("input", () => { pending = null; instructions.setCustomValidity(""); refs.setCustomValidity(""); });
    form.addEventListener("submit", event => { event.preventDefault(); busy(submit, async () => {
      const evidence = refs.value.split("\n").map(v => v.trim()).filter(Boolean);
      instructions.setCustomValidity(instructions.value.trim().length < 12 ? "Describe the requested correction." : "");
      refs.setCustomValidity(evidence.length > 50 || evidence.some(v => v.length > 500) || new Set(evidence).size !== evidence.length ? "Use up to 50 unique references." : "");
      if (!form.reportValidity()) return;
      pending ??= revisionRequest(data, instructions.value.trim(), evidence); const receipt = await command(pending);
      dialog.close(); await open(data.candidate.id); message("Correction request saved."); correctionEditor(data, receipt.task);
    }); }); dialog.append(form); document.body.append(dialog); dialog.addEventListener("close", () => dialog.remove()); dialog.showModal();
  }
  function withdrawCorrection(data, task) {
    const dialog = node("dialog"); dialog.setAttribute("aria-label", "Withdraw correction request");
    const form = node("form"); form.append(node("h2", "Withdraw correction request"), node("p", task.instructions, "copy"));
    const note = field(form, "Reason for withdrawal", node("textarea")); note.required = true; note.minLength = 12; note.maxLength = 6000;
    const close = node("button", "Keep request"); close.type = "button"; close.addEventListener("click", () => dialog.close());
    const submit = node("button", "Record withdrawal"); submit.type = "submit"; form.append(close, submit);
    let pending = null; form.addEventListener("input", () => { pending = null; });
    form.addEventListener("submit", event => { event.preventDefault(); busy(submit, async () => {
      pending ??= { action: "cancel_revision", command_id: crypto.randomUUID(), candidate_id: data.candidate.id, task_id: task.id,
        version_id: task.version_id, content_hash: task.content_hash, note: note.value.trim() };
      await command(pending); dialog.close(); message("Withdrawal recorded; no copy was approved."); await refresh();
    }); }); dialog.append(form); document.body.append(dialog); dialog.addEventListener("close", () => dialog.remove()); dialog.showModal();
  }
  function renderCorrections(doc, data) {
    const section = node("section", undefined, "revision-tasks"); section.append(node("h3", "Correction requests"));
    const tasks = data.revision_tasks;
    if (!tasks.length) section.append(node("p", "No saved correction requests.", "muted"));
    for (const task of tasks) {
      const item = node("details"); item.open = ["open", "stale"].includes(task.status);
      item.append(node("summary", "Correction request - " + task.status), node("p", task.instructions, "copy"),
        node("p", "Base version: " + task.version_id + " / " + task.content_hash, "hash"));
      if (task.evidence_refs.length) item.append(node("pre", task.evidence_refs.join("\n")));
      if (task.status === "open" && data.can_edit) {
        const resume = node("button", "Resume correction"); resume.type = "button"; resume.addEventListener("click", () => correctionEditor(data, task)); item.append(resume);
      }
      if (task.status === "stale") item.append(node("p", "A newer copy exists. This request is not automatically transferred or marked complete.", "status"));
      if (["open", "stale"].includes(task.status) && task.can_cancel) {
        const cancel = node("button", "Withdraw request"); cancel.type = "button"; cancel.addEventListener("click", () => withdrawCorrection(data, task)); item.append(cancel);
      }
      if (task.resolution) item.append(node("p", task.resolution.note, "muted"), node("p", "Result version: " + (task.resolution.result_version_id || "No copy change"), "hash"));
      section.append(item);
    }
    doc.append(section);
  }
  function correctionEditor(data, task) {
    const dialog = node("dialog"); dialog.id = "correction-dialog"; dialog.setAttribute("aria-labelledby", "correction-title");
    const form = node("form"), heading = node("div", undefined, "dialog-heading");
    const title = node("h2", "Revise complete copy"); title.id = "correction-title";
    const close = node("button", "\u00d7"); close.type = "button"; close.setAttribute("aria-label", "Close correction editor"); close.addEventListener("click", () => dialog.close());
    heading.append(title, close); form.append(heading, node("p", "This saves a new immutable version. Earlier decisions remain in history but do not approve the revised copy.", "muted"));
    const binding = node("p", data.candidate.external_id + " / Version " + data.version.id, "hash"); form.append(binding);
    form.append(node("h3", "Saved correction instructions"), node("p", task.instructions, "copy saved-instructions"));
    if (task.evidence_refs.length) form.append(node("pre", task.evidence_refs.join("\n")));
    const payload = structuredClone(data.version.payload), original = JSON.stringify(payload);
    const titleInput = field(form, "Title", node("input")); titleInput.name = "title"; titleInput.value = data.version.title; titleInput.required = true; titleInput.maxLength = 400;
    const display = key => ({ meaning_en: "Homepage meaning - English", meaning_hi: "Homepage meaning - Hindi", iast: "IAST", sanskrit: "Sanskrit", hindi: "Hindi equivalent", english: "English equivalent", body: "Complete article text", reuse_approval_ref: "Actual source-use clearance reference (leave empty if pending)", review_status: "Source review status" }[key] || key.replaceAll("_", " "));
    function editObject(parent, object, path = "") {
      for (const [key, value] of Object.entries(object)) {
        if (["contract_version", "kind", "desk", "research_refs", "media"].includes(key)) continue;
        const name = path ? path + "." + key : key;
        if (value !== null && typeof value === "object") {
          const box = node("fieldset", undefined, "copy-fields"); box.append(node("legend", display(key)));
          if (Array.isArray(value)) {
            const entries = node("div"), add = node("button", "Add " + display(key)); add.type = "button";
            const template = structuredClone(value[0] ?? (key === "sources" ? { title: "", url: "" } : ""));
            const blank = item => Array.isArray(item) ? [] : item && typeof item === "object" ? Object.fromEntries(Object.entries(item).map(([k, v]) =>
              [k, ["source_kind", "relation", "original_language", "kind"].includes(k) ? v : k === "review_status" ? "pending" : k === "reuse_approval_ref" ? null : blank(v)])) : "";
            function renderEntries() {
              entries.replaceChildren();
              value.forEach((entry, i) => {
                const item = node("fieldset"); item.append(node("legend", String(i + 1)));
                if (entry && typeof entry === "object") editObject(item, entry, name + "." + i);
                else { const input = field(item, "Reference " + (i + 1), node("input")); input.value = entry; input.name = name + "." + i; input.addEventListener("input", () => { value[i] = input.value; }); }
                const remove = node("button", "Remove " + display(key) + " " + (i + 1)); remove.type = "button";
                remove.addEventListener("click", () => { value.splice(i, 1); pending = null; renderEntries(); }); item.append(remove); entries.append(item);
              });
            }
            add.addEventListener("click", () => { value.push(blank(template)); pending = null; renderEntries(); });
            renderEntries(); box.append(entries, add);
          }
          else editObject(box, value, name);
          parent.append(box); continue;
        }
        const input = node(["meaning_en", "meaning_hi", "reflection_en", "reflection_hi", "body"].includes(key) || /text|explanation|translation|body|attribution|note/.test(key) ? "textarea" : "input");
        input.name = name; input.value = value ?? ""; if (input.tagName === "TEXTAREA") input.rows = key === "body" ? 16 : 4;
        field(parent, display(key), input);
        input.addEventListener("input", () => { object[key] = value === null && input.value === "" ? null : input.value; });
      }
    }
    editObject(form, data.candidate.kind === "word" ? payload.content : { body: payload.body, sources: payload.sources });
    if (data.candidate.kind === "article") form.querySelector('[name="body"]').addEventListener("input", event => { payload.body = event.target.value; });
    const layoutEditor = data.candidate.kind === "article" ? articleLayoutEditor(form, payload, data) : null;
    if (!layoutEditor) form.append(node("p", "Word public copy has no image slot. No image will be added to its publication contract.", "muted"));
    const status = node("p"); status.setAttribute("role", "status"); form.append(status);
    const comparison = node("section", undefined, "change-comparison"); comparison.hidden = true;
    const comparisonAck = node("input"); comparisonAck.type = "checkbox"; comparisonAck.name = "comparison_acknowledged";
    const ackLabel = node("label", "I reviewed the before/after changes. This is not approval for publication.", "checkbox-label"); ackLabel.prepend(comparisonAck); ackLabel.hidden = true;
    const save = node("button", "Review corrected copy", "primary"); save.type = "submit"; form.append(comparison, ackLabel, save);
    let pending = null, submitted = false, comparedCopy = null;
    function resetComparison(event) {
      pending = null; if (event.target === comparisonAck) return;
      comparedCopy = null; comparison.hidden = true; ackLabel.hidden = true; comparisonAck.checked = false; comparisonAck.required = false; save.textContent = "Review corrected copy";
    }
    form.addEventListener("input", resetComparison); form.addEventListener("change", resetComparison);
    form.addEventListener("submit", event => { event.preventDefault(); busy(save, async () => {
      if (layoutEditor?.loading()) { status.textContent = "Wait for image validation to complete."; return; }
      layoutEditor?.sync();
      if (JSON.stringify(payload) === original && titleInput.value === data.version.title) { status.textContent = "No correction was made."; return; }
      const proposed = JSON.stringify({ title: titleInput.value.trim(), payload });
      if (comparedCopy !== proposed) {
        const changes = [];
        function compare(before, after, path = "copy") {
          if (JSON.stringify(before) === JSON.stringify(after)) return;
          if (before && after && typeof before === "object" && typeof after === "object") {
            for (const key of [...new Set([...Object.keys(before), ...Object.keys(after)])].sort()) compare(before[key], after[key], path + "." + key);
          } else changes.push({ path, before, after });
        }
        compare({ title: data.version.title, payload: data.version.payload }, { title: titleInput.value.trim(), payload });
        const displayChange = (value, path) => {
          const imageData = data => data ? "Private PNG data (" + data.length + " encoded characters)" : "No uploaded image";
          if (path.endsWith("upload_png")) return imageData(value);
          if (value === undefined) return "Not present";
          return value !== null && typeof value === "object" ? JSON.stringify(value, (key, data) => key === "upload_png" ? imageData(data) : data, 2) : String(value);
        };
        comparison.replaceChildren(node("h3", "Before / After"));
        for (const change of changes) {
          const row = node("section", undefined, "comparison-row"); row.append(node("h4", change.path.replaceAll("_", " ")));
          const columns = node("div", undefined, "comparison-columns");
          for (const [label, value] of [["Before", change.before], ["After", change.after]]) {
            const side = node("div"); side.append(node("strong", label), node("p", displayChange(value, change.path), "copy")); columns.append(side);
          } row.append(columns); comparison.append(row);
        }
        if (!changes.length) { status.textContent = "No correction was made."; return; }
        comparedCopy = proposed; comparison.hidden = false; ackLabel.hidden = false; comparisonAck.checked = false; comparisonAck.required = true;
        save.textContent = "Submit corrected copy for review"; status.textContent = "Review the proposed changes and acknowledge them before submitting."; return;
      }
      if (!comparisonAck.checked) { status.textContent = "Acknowledge the displayed changes before submitting."; return; }
      if (!confirm("Save this complete revised copy as a new version with fresh reviews required?")) return;
      pending ??= { action: "submit_revision", command_id: crypto.randomUUID(), candidate_id: data.candidate.id, task_id: task.id,
        version_id: task.version_id, content_hash: task.content_hash, kind: data.candidate.kind, title: titleInput.value.trim(), payload, comparison_acknowledged: true };
      try { await command(pending); } catch (error) { status.textContent = friendly(error.message); throw error; }
      submitted = true; dialog.close(); message("Corrected version submitted and linked to its saved instructions. Prior approvals do not apply to this copy."); await refresh();
    }); });
    dialog.append(form); document.body.append(dialog); dialog.addEventListener("close", () => { layoutEditor?.cleanup(); dialog.remove(); if (!submitted && selected?.candidate.id === data.candidate.id) open(data.candidate.id).catch(error => message(friendly(error.message))); }); dialog.showModal();
  }
  async function open(id) {
    const seq = ++loadSequence;
    const data = await command({ action: "open", candidate_id: id });
    const revisions = await command({ action: "list_revisions", candidate_id: id });
    if (!Array.isArray(revisions.tasks)) throw Error("revision_task_unavailable");
    data.revision_tasks = revisions.tasks;
    if (seq !== loadSequence) return;
    selected = data; renderQueue();
    const doc = $("document"), p = data.version.payload;
    if (view === "live") {
      const publication = items.find(i => i.id === id)?.workflow.publication;
      if (!publication) { clearSelection(); return; }
      doc.replaceChildren(node("h2", publication.title || data.version.title), node("p", "Published version: " + publication.version_id, "hash"), node("p", publication.content_hash, "hash"));
      if (publication.kind === "article") {
        detail(doc, "Sector", $("desk-filter").querySelector('option[value="' + publication.desk + '"]').textContent);
        const link = node("a", "Read live Article"); link.href = publication.public_url; link.target = "_blank"; link.rel = "noopener noreferrer"; doc.append(link);
      } else {
        detail(doc, "Publication date", publication.date_key + " / " + publication.timezone);
        detail(doc, "Word", publication.content.sanskrit + " / " + publication.content.iast + " / " + publication.content.english);
        detail(doc, "English meaning", publication.content.meaning_en); detail(doc, "Hindi meaning", publication.content.meaning_hi);
      }
      $("review").replaceChildren(node("h2", "Published record"), node("p", publication.kind === "article" ? "The served Article matches its exact release receipt." : "Recorded daily publication history; not a claim of today's homepage assignment.", "muted"));
      if (publication.version_id !== data.version.id) $("review").append(node("p", "A newer draft exists separately. Its reviews do not rewrite this published version.", "status"));
      return;
    }
    doc.replaceChildren(node("h2", data.version.title), node("p", data.candidate.external_id, "muted"), node("p", data.version.content_hash, "hash"));
    const workflow = items.find(i => i.id === id)?.workflow;
    if (workflow) doc.append(node("p", stages[workflow.stage], "status"));
    doc.append(node("p", "Version: " + data.version.id, "version-label"));
    if (data.can_edit) {
      const edit = node("button", "Propose corrected version"); edit.type = "button";
      edit.addEventListener("click", () => requestCorrection(data)); doc.append(edit);
    }
    if (data.candidate.kind === "word") {
      const c = p.content;
      detail(doc, "Word", [c.sanskrit, c.iast, c.english, c.hindi].filter(Boolean).join(" / "));
      detail(doc, "Meaning", c.meaning_en); detail(doc, "Hindi meaning", c.meaning_hi);
      detail(doc, "Explore meaning", c.meaning_details?.explanation_en); detail(doc, "Hindi explanation", c.meaning_details?.explanation_hi);
      detail(doc, "Process", c.meaning_details?.method_summary_en);
      for (const reference of c.meaning_details?.scriptural_references ?? []) {
        detail(doc, reference.work + " / " + reference.locator, reference.original_text);
        detail(doc, "Translation", reference.translation_en); detail(doc, "Hindi translation", reference.translation_hi);
      }
      for (const section of c.meaning_details?.philosophical_essay?.sections ?? []) {
        detail(doc, section.heading_en, section.body_en); detail(doc, section.heading_hi, section.body_hi);
      }
    } else {
      const length = data.article_length;
      doc.append(node("p", length ? length.words + " words - " + (length.blocker ? "outside the " + length.min.toLocaleString("en-US") + "-" + length.max.toLocaleString("en-US") + " word long-form standard" : "long-form length check passed") : "Long-form length check unavailable.", "article-word-count"));
      for (let i = 0; i < Math.max(1, p.media.length); i++) renderArticleMedia(doc, data, i);
      const preview = node("details"); preview.append(node("summary", "Reading layout preview"));
      const frame = node("iframe"); frame.title = "Exact saved Article reading layout"; frame.className = "article-reading-preview";
      frame.setAttribute("sandbox", "allow-same-origin"); frame.loading = "lazy";
      frame.src = endpoint + "?" + new URLSearchParams({ action: "preview", candidate_id: data.candidate.id, version_id: data.version.id, content_hash: data.version.content_hash });
      preview.append(frame); doc.append(preview);
      for (const ref of p.research_refs ?? []) if (/^(?:image_relevance_failure|prepublication_|qualification_blocker:)/.test(ref)) doc.append(node("p", ref, "article-review-warning"));
      detail(doc, p.desk, p.body);
    }
    renderCorrections(doc, data);
    if (data.review_state.reviews_complete && data.revision_tasks.some(t => t.status === "submitted" && t.resolution?.result_version_id === data.version.id)) {
      const feedback = node("button", "Export correction feedback"); feedback.type = "button";
      feedback.addEventListener("click", () => busy(feedback, async () => {
        const packet = await request("learning_feedback", { candidate_id: data.candidate.id, version_id: data.version.id, content_hash: data.version.content_hash });
        const url = URL.createObjectURL(new Blob([JSON.stringify(packet, null, 2)], { type: "application/json" }));
        const link = node("a"); link.href = url; link.download = "editorial-feedback-" + data.version.id + ".json";
        document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
        message("Candidate feedback exported. No lesson was promoted and no copy or publication rule was changed.");
      })); doc.append(feedback);
    }
    const raw = node("details"), summary = node("summary", "Full immutable copy & evidence"), pre = node("pre", JSON.stringify(p, null, 2));
    raw.append(summary, pre); doc.append(raw);
    const history = node("details"); history.append(node("summary", "Decision & release history"), node("pre", JSON.stringify({ decisions: data.decisions, release_requests: data.release_requests }, null, 2))); doc.append(history);
    const side = $("review"); side.replaceChildren(node("h2", view === "acceptance" ? "Publisher Acceptance" : view === "publishing" ? "Controlled Publication" : view === "delivery" ? "Delivery Queue" : "Review & Clearance"));
    if (view === "delivery") side.append(node("p", data.candidate.kind === "word" ? "Eligible in the daily pool; the governed cycle must still select and publish it. No daily date is inferred." : "Commit delivered. Live status requires the deployed page to match its release receipt.", "delivery-status"));
    const list = node("ul", undefined, "scope-list");
    for (const scope of data.review_state.required_scopes) list.append(node("li", scope.replaceAll("_", " ") + ": " + (data.review_state.approved_scopes.includes(scope) ? "Approved" : "Pending"), data.review_state.approved_scopes.includes(scope) ? "complete" : ""));
    side.append(list);
    if (data.review_state.pending_revision_tasks > 0) side.append(node("p", friendly("editorial_corrections_pending"), "status"));
    const scopes = data.review_state.required_scopes.filter(scope => granted(data.candidate.kind, scope) &&
      (view === "review" ? ["review", "corrections"].includes(workflow?.stage) && scope !== "publisher_acceptance" :
        view === "acceptance" && workflow?.stage === "acceptance" && scope === "publisher_acceptance"));
    const canReview = data.review_permissions?.can_review !== false;
    if (scopes.length && canReview && view === "review") consolidatedReview(side, data, scopes);
    if (scopes.length && canReview && view === "acceptance") {
      const form = node("form", undefined, "review-form");
      const scope = node("select"), decision = node("select"), note = node("textarea"), refs = node("textarea");
      for (const name of scopes) scope.append(new Option(name.replaceAll("_", " "), name));
      for (const [value, label] of [["revise", "Request revision"], ["reject", "Reject"], ["approve", "Approve exact copy"]]) decision.append(new Option(label, value));
      note.required = true; note.maxLength = 6000; note.rows = 3; refs.rows = 3;
      decision.addEventListener("change", () => { refs.required = decision.value === "approve"; refs.setCustomValidity(""); });
      for (const input of [note, refs]) input.addEventListener("input", () => input.setCustomValidity(""));
      note.placeholder = "Section, finding, proposed correction, reason and remaining checks.";
      refs.placeholder = "Existing evidence ID or specific source URL";
      for (const [label, input] of [["Review scope", scope], ["Decision", decision], ["Rationale", note], ["Evidence references, one per line", refs]]) { const l = node("label", label); l.append(input); form.append(l); }
      const sourceOptions = data.candidate.kind === "word" ? p.content.sources : p.sources;
      const picker = node("select"); picker.setAttribute("aria-label", "Recorded source reference"); picker.append(new Option("Recorded sources", ""));
      for (const source of sourceOptions ?? []) {
        const value = source.evidence_ref || source.url || source.recorded?.url || (typeof source.recorded === "string" ? source.recorded : null);
        if (typeof value === "string" && value.length <= 500) picker.append(new Option(source.title || source.recorded?.label || value, value));
      }
      if (picker.options.length > 1) {
        const add = node("button", "Add source reference"); add.type = "button";
        add.addEventListener("click", () => { const values = refs.value.split("\n").map(v => v.trim()).filter(Boolean); if (picker.value && !values.includes(picker.value)) { refs.value = [...values, picker.value].join("\n"); refs.setCustomValidity(""); } });
        form.append(picker, add);
      }
      let exceptionReason = null, exceptionAck = null;
      if (data.review_permissions?.self_review_exception_required) {
        const box = node("fieldset", undefined, "self-review-notice"); box.append(node("legend", "Admin self-review exception"));
        exceptionAck = node("input"); exceptionAck.type = "checkbox"; exceptionAck.required = true;
        const ack = node("label", "Record an exception for my own submitted or edited copy", "checkbox-label"); ack.prepend(exceptionAck);
        exceptionReason = node("textarea"); exceptionReason.required = true; exceptionReason.minLength = 12; exceptionReason.maxLength = 6000;
        exceptionReason.addEventListener("input", () => exceptionReason.setCustomValidity(""));
        const reason = node("label", "Exception reason"); reason.append(exceptionReason); box.append(ack, reason); form.append(box);
      }
      const subjectBox = node("fieldset", undefined, "subject-review-notice");
      subjectBox.append(node("legend", "Admin subject-review exception"));
      const subjectAck = node("input"); subjectAck.type = "checkbox";
      const subjectLabel = node("label", "I am personally reviewing this subject as Admin, without claiming verified specialist credentials.", "checkbox-label"); subjectLabel.prepend(subjectAck);
      const subjectReason = node("textarea"); subjectReason.minLength = 12; subjectReason.maxLength = 6000;
      const subjectReasonLabel = node("label", "Subject-review basis and limitations"); subjectReasonLabel.append(subjectReason);
      subjectBox.append(subjectLabel, subjectReasonLabel); form.append(subjectBox);
      const needsSubjectException = () => (data.review_permissions?.subject_review_exception_scopes ?? []).includes(scope.value);
      const syncSubjectException = () => {
        const needed = needsSubjectException(); subjectBox.hidden = !needed;
        subjectAck.required = needed; subjectReason.required = needed;
        subjectReason.setCustomValidity(""); subjectAck.checked = false; subjectReason.value = "";
      };
      scope.addEventListener("change", syncSubjectException); syncSubjectException();
      subjectReason.addEventListener("input", () => subjectReason.setCustomValidity(""));
      const submit = node("button", "Return to Editor", "primary"); submit.type = "submit"; form.append(submit);
      function syncAcceptance() {
        const returning = decision.value === "revise"; submit.textContent = returning ? "Return to Editor" : "Record decision";
        note.minLength = returning ? 12 : 1;
        if (exceptionReason) { exceptionReason.required = !returning; exceptionAck.required = !returning; }
      }
      decision.addEventListener("change", syncAcceptance); syncAcceptance();
      form.addEventListener("submit", event => { event.preventDefault(); busy(submit, async () => {
        const evidence = refs.value.split("\n").map(s => s.trim()).filter(Boolean);
        if (decision.value === "revise") {
          note.setCustomValidity(note.value.trim().length < 12 ? "Describe the required correction in at least 12 characters." : "");
          refs.setCustomValidity(evidence.length > 50 || evidence.some(v => v.length > 500) || new Set(evidence).size !== evidence.length ? "Use up to 50 unique references of at most 500 characters." : "");
          if (!form.reportValidity()) return;
          await command(revisionRequest(data, note.value.trim(), evidence)); await refresh();
          message("Returned to Editor with saved correction instructions. No approval or publication recorded."); return;
        }
        note.setCustomValidity(note.value.trim() ? "" : "Enter the finding and reason for this decision.");
        refs.setCustomValidity(decision.value === "approve" && !evidence.length ? "Approval requires an actual evidence reference." :
          evidence.length > 50 || evidence.some(s => s.length > 500) ? "Use up to 50 references, each at most 500 characters." :
          new Set(evidence).size !== evidence.length ? "Remove duplicate evidence references." : "");
        if (exceptionReason) exceptionReason.setCustomValidity(exceptionReason.value.trim().length < 12 ? "Enter a substantive Admin exception reason." : "");
        if (needsSubjectException()) subjectReason.setCustomValidity(subjectReason.value.trim().length < 12 ? "Enter the evidence, review basis and any limitations of your Admin subject review." : "");
        if (!form.reportValidity()) return;
        if (!confirm("Record this decision for the displayed immutable copy?")) return;
        await command({ action: "decision", command_id: crypto.randomUUID(), candidate_id: data.candidate.id, version_id: data.version.id, content_hash: data.version.content_hash,
          scope: scope.value, decision: decision.value, note: note.value.trim(), evidence_refs: evidence,
          ...(needsSubjectException() ? { subject_review_exception: { policy_ref: session.subject_review_policy_ref, reason: subjectReason.value.trim(), acknowledged: subjectAck.checked } } : {}),
          ...(exceptionReason ? { admin_exception: { policy_ref: session.self_review_policy_ref, reason: exceptionReason.value, acknowledged: exceptionAck.checked } } : {}) });
        message("Decision recorded for this version. Publication remains separately controlled."); await refresh();
      }); });
      side.append(form);
    }
    if (!canReview && view !== "publishing") side.append(node("p", "Review is unavailable: this copy requires an independent assigned reviewer.", "muted"));
    let releaseButton = null;
    if (view === "publishing") {
      const deliveryStatus = node("p", "A release request is not publication. Delivery also requires an activated trusted worker and the existing publisher checks.", "delivery-status");
      side.append(deliveryStatus);
      const readiness = node("div", undefined, "release-readiness"); readiness.setAttribute("aria-live", "polite");
      const missing = data.review_state.required_scopes.filter(s => !data.review_state.approved_scopes.includes(s));
      readiness.append(node("p", missing.length ? "Release blocked: " + missing.map(s => s.replaceAll("_", " ")).join(", ") + "." : "Reviews complete. Check delivery readiness before requesting release."));
      const check = node("button", "Check release readiness"); check.type = "button";
      check.addEventListener("click", () => busy(check, async () => {
        const result = await request("release_check", { action: "open", candidate_id: id });
        if (selected?.version.id !== data.version.id || view !== "publishing") return;
        readiness.replaceChildren(node("p", result.missing_scopes.length ? "Pending reviews: " + result.missing_scopes.map(s => s.replaceAll("_", " ")).join(", ") : "No missing review scopes."));
        for (const reason of result.blockers) readiness.append(node("p", friendly(reason)));
        if (releaseButton) releaseButton.disabled = !result.request_allowed;
        if (result.delivery_enabled) {
          deliveryStatus.textContent = data.candidate.kind === "article" ?
            "Article publishing is connected. Only the exact fully approved copy can be delivered to the public site." :
            "The daily Word handoff is connected. Approved AG70E registration and the independent daily publication controls still apply.";
          if (releaseButton) releaseButton.textContent = data.candidate.kind === "article" ? "Publish approved article" : "Send to daily publish queue";
        }
        if (result.delivery_enabled && result.request_allowed) readiness.append(node("p", "Ready for controlled delivery validation."));
      })); side.append(readiness, check);
      if (data.candidate.kind === "word" && session?.is_administrator) {
        const registration = node("form", undefined, "word-registration-form");
        registration.append(node("h3", "Approved-bank registration"));
        registration.append(node("p", "Registration requires completed reviews and cleared source metadata. It does not assign a daily date or activate publishing.", "muted"));
        const uncleared = (p.content.sources ?? []).filter(source => source.review_status !== "approved" || !source.reuse_approval_ref);
        if (uncleared.length) registration.append(node("p", "Source clearance still pending: " + uncleared.map(source => source.title || source.evidence_ref).join("; ") + ". A corrected source record creates a new copy requiring fresh reviews.", "status"));
        const inputs = {};
        for (const [name, label] of [["canonical_lexical_identity_id", "Reviewed lexical identity ID"], ["lemma_id", "Reviewed lemma ID"], ["equivalence_group_id", "Reviewed equivalence group ID"], ["context_signal_id", "Approved context signal ID"]]) {
          const input = node("input"); input.name = name; input.required = true; input.maxLength = 200;
          input.pattern = "[a-zA-Z0-9][a-zA-Z0-9._:@\\x2f\\x2d]{0,199}"; inputs[name] = input;
          const l = node("label", label); l.append(input); registration.append(l);
        }
        const note = node("textarea"); note.required = true; note.minLength = 12; note.maxLength = 6000;
        const noteLabel = node("label", "Identity, equivalence and applicability decision basis"); noteLabel.append(note); registration.append(noteLabel);
        const ack = node("input"); ack.type = "checkbox"; ack.required = true;
        const ackLabel = node("label", "I confirm this exact copy makes no etymological claim and these metadata reflect my reviewed decisions.", "checkbox-label"); ackLabel.prepend(ack); registration.append(ackLabel);
        const register = node("button", "Register approved Word", "primary"); register.type = "submit";
        register.disabled = !data.review_state.reviews_complete || uncleared.length > 0; registration.append(register);
        let registrationCommand = null;
        registration.addEventListener("input", () => { registrationCommand = null; });
        registration.addEventListener("submit", event => { event.preventDefault(); busy(register, async () => {
          if (!registration.reportValidity()) return;
          if (!confirm("Register this exact fully reviewed copy and your declared lexical metadata in the immutable AG70E bank? This is not daily publication.")) return;
          registrationCommand ??= { action: "register_word", command_id: crypto.randomUUID(), candidate_id: data.candidate.id,
            version_id: data.version.id, content_hash: data.version.content_hash,
            metadata: { ...Object.fromEntries(Object.entries(inputs).map(([key, input]) => [key, input.value.trim()])), no_etymological_claim: ack.checked }, note: note.value.trim() };
          const receipt = await request("word_register", registrationCommand);
          message("Approved Word registered: " + receipt.candidate_ref + ". Daily eligibility, release configuration and scheduling remain separately governed."); await open(id);
        }); }); side.append(registration);
      }
    }
    if (granted(data.candidate.kind, "release") && view === "publishing") {
      const release = node("button", "Request controlled release"); release.disabled = data.candidate.kind === "word" || !data.review_state.reviews_complete || data.review_permissions?.can_request_release === false || !data.article_length || Boolean(data.article_length.blocker);
      releaseButton = release;
      let releaseCommand = null;
      release.addEventListener("click", () => busy(release, async () => {
        if (!confirm("Request controlled release of this exact copy? An activated worker may deliver fully approved content. Word selection remains governed by the existing daily engine.")) return;
        releaseCommand ??= { action: "request_release", command_id: crypto.randomUUID(), candidate_id: data.candidate.id, version_id: data.version.id, content_hash: data.version.content_hash };
        const receipt = await request("release", releaseCommand);
        message(friendly(receipt.status) + (receipt.code ? " " + friendly(receipt.code) : "") +
          (receipt.delivery ? " " + (receipt.delivery.status === "eligible_for_daily_selection" ? "Word is eligible in the daily bank, not forced onto today's card." : "Article commit recorded; deployment readiness remains separate.") : ""));
        await refresh();
      })); side.append(release);
    }
    side.append(node("p", "Review acceptance does not publish a word or article. Existing publisher validation and operational authorization remain required.", "muted"));
  }
  async function activate(next) {
    if (next === "people" && !session?.is_administrator) return;
    view = next;
    loadSequence++;
    $("review").replaceChildren(node("h2", labels[next] || "People & Permissions"));
    $("document").replaceChildren(node("h2", "Loading queue"));
    for (const tab of document.querySelectorAll("[data-view]")) { const active = tab.dataset.view === next; tab.setAttribute("aria-selected", String(active)); tab.tabIndex = active ? 0 : -1; }
    $("content-panel").hidden = next === "people"; $("people-panel").hidden = next !== "people";
    $("content-panel").setAttribute("aria-labelledby", "tab-" + next);
    if (next === "people") await loadPeople();
    else { $("queue-heading").textContent = labels[next]; await refresh(); }
  }
  for (const tab of document.querySelectorAll("[data-view]")) {
    tab.addEventListener("click", () => busy(tab, () => activate(tab.dataset.view)));
    tab.addEventListener("keydown", event => {
      const tabs = [...document.querySelectorAll("[data-view]")].filter(t => !t.hidden);
      const index = tabs.indexOf(tab); let next;
      if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
      if (event.key === "ArrowLeft") next = tabs[(index + tabs.length - 1) % tabs.length];
      if (event.key === "Home") next = tabs[0]; if (event.key === "End") next = tabs.at(-1);
      if (next) { event.preventDefault(); next.focus(); busy(next, () => activate(next.dataset.view)); }
    });
  }
  function renderAssignmentOptions(candidates = items) {
    const select = $("assignment-form").elements.candidate_id;
    select.replaceChildren(...candidates.map(item => new Option(item.title + " / " + item.kind, item.id)));
  }
  function responsibilityOptions() {
    const form = $("capability-form"), role = form.elements.role.value, kind = form.elements.kind.value;
    const scopes = role === "accepter" ? ["publisher_acceptance"] : role === "publisher" ? ["release"] : role === "contributor" ? ["intake"] :
      kind === "word" ? ["linguistic", "iast", "rights", "editorial", "context", "safety", "textual", "philosophical"] : ["editorial", "rights", "factual", "safety", "media"];
    form.elements.scope.replaceChildren(...scopes.map(scope => new Option(scope.replaceAll("_", " "), scope)));
  }
  $("capability-form").elements.kind.addEventListener("change", responsibilityOptions);
  $("capability-form").elements.role.addEventListener("change", responsibilityOptions);
  responsibilityOptions();
  async function loadPeople() {
    renderAssignmentOptions((await command({ action: "list" })).items);
    const result = await command({ action: "people" }); const register = $("people-register"); register.replaceChildren();
    for (const member of result.people) {
      const section = node("section"); section.append(node("h3", member.email));
      for (const grant of member.capabilities) section.append(node("p", grant.kind + " / " + grant.scope + " / " +
        (grant.revoked_at ? "Revoked" : new Date(grant.expires_at) <= new Date() ? "Expired" : "Active") + " / " + grant.expires_at));
      register.append(section);
    }
    $("access-history").textContent = JSON.stringify(result.audit_events ?? [], null, 2);
  }
  async function lookupPerson() {
    const email = $("person-lookup").elements.email.value.trim().toLowerCase();
    const result = await command({ action: "lookup_person", email }); person = result.person;
    $("person-detail").replaceChildren(node("h3", person.email), node("pre", JSON.stringify({ capabilities: person.capabilities, assignments: person.assignments }, null, 2)));
    $("access-controls").hidden = false;
  }
  $("person-lookup").elements.email.addEventListener("input", () => { person = null; $("access-controls").hidden = true; $("person-detail").replaceChildren(); });
  $("person-lookup").addEventListener("submit", event => { event.preventDefault(); busy(event.currentTarget.querySelector("button"), lookupPerson); });
  for (const [id, action] of [["capability-form", "set_capability"], ["assignment-form", "set_assignment"]]) {
    $(id).addEventListener("submit", event => {
      event.preventDefault(); const form = event.currentTarget;
      busy(form.querySelector('[type="submit"]'), async () => {
        if (!person || person.email !== $("person-lookup").elements.email.value.trim().toLowerCase()) throw new Error("Look up the account before changing access.");
        const fields = new FormData(form), body = { action, command_id: crypto.randomUUID(), email: person.email,
          operation: fields.get("operation"), access_days: Number(fields.get("access_days")), note: fields.get("note") };
        if (action === "set_capability") Object.assign(body, { kind: fields.get("kind"), scope: fields.get("scope"),
          qualification_ref: fields.get("qualification_ref").trim() || null, qualification_verified: fields.has("qualification_verified") });
        else body.candidate_id = fields.get("candidate_id");
        if (!confirm("Record this access decision for " + person.email + "?")) return;
        await command(body); message("Access decision recorded. No content was approved or published."); await loadPeople(); await lookupPerson();
        session = await request("session"); await refresh();
      });
    });
  }
  function preparedArticleImport() {
    const dialog = node("dialog"); dialog.setAttribute("aria-label", "Import prepared Articles");
    const form = node("form"); form.append(node("h2", "Prepared Articles"));
    const file = field(form, "Prepared intake file", node("input")); file.type = "file"; file.accept = ".json,application/json";
    const preview = node("div"), result = node("div"); result.setAttribute("role", "status");
    const ack = node("input"); ack.type = "checkbox"; ack.required = true;
    const label = node("label", "Submit these copies for review, without approval or publication.", "checkbox-label"); label.prepend(ack);
    const close = node("button", "Close"); close.type = "button"; close.addEventListener("click", () => dialog.close());
    const submit = node("button", "Submit pending copies", "primary"); submit.type = "submit"; submit.disabled = true;
    form.append(preview, label, result, close, submit);
    let commands = null, completed = false;
    file.addEventListener("change", async () => {
      commands = null; completed = false; submit.disabled = true; ack.checked = false; preview.replaceChildren(); result.replaceChildren();
      try {
        const chosen = file.files[0]; if (!chosen || chosen.size > 240000) throw Error("Choose a prepared JSON file up to 240 KB.");
        const parsed = JSON.parse(await chosen.text());
        if (!Array.isArray(parsed) || !parsed.length || parsed.length > 5 || parsed.some(c => c?.action !== "intake" || c.kind !== "article"))
          throw Error("Choose the prepared Article intake-commands.json file.");
        const table = node("table"), head = node("tr");
        for (const text of ["Article", "Desk", "Body words", "Sources", "Images"]) head.append(node("th", text));
        const thead = node("thead"); thead.append(head); table.append(thead); const body = node("tbody");
        for (const c of parsed) {
          const row = node("tr"), p = c.payload ?? {};
          for (const text of [c.title, p.desk, typeof p.body === "string" ? p.body.trim().split(/\s+/).filter(Boolean).length : 0,
            Array.isArray(p.sources) ? p.sources.length : 0, Array.isArray(p.media) ? p.media.length : 0]) row.append(node("td", String(text ?? "")));
          body.append(row);
        }
        table.append(body); preview.append(table); commands = parsed; submit.disabled = false;
      } catch (error) { result.textContent = error.message; }
    });
    form.addEventListener("submit", event => { event.preventDefault(); busy(submit, async () => {
      if (!commands || completed || !form.reportValidity()) return;
      try {
        const receipt = await request("article_intake", { commands });
        completed = true; result.textContent = receipt.receipts.length + " private copies saved. No approvals or publication recorded.";
        file.disabled = true; ack.disabled = true; await refresh();
      } catch (error) {
        const receipt = error.result;
        result.textContent = friendly(error.message) + (Array.isArray(receipt?.receipts) ? " Confirmed saved copies: " + receipt.receipts.length + "." : "");
        if (receipt?.uncertain_command_id) result.append(node("p", "Reconcile command: " + receipt.uncertain_command_id));
      }
    }).then(() => { submit.disabled = completed || !commands; }); });
    dialog.append(form); dialog.addEventListener("close", () => dialog.remove()); document.body.append(dialog); dialog.showModal();
  }
  $("kind-filter").addEventListener("change", () => { $("desk-filter").disabled = $("kind-filter").value === "word"; if ($("desk-filter").disabled) $("desk-filter").value = "all"; refresh().catch(e => message(friendly(e.message))); });
  for (const id of ["desk-filter", "queue-scope"]) $(id).addEventListener("change", () => refresh().catch(e => message(friendly(e.message))));
  $("queue-more").addEventListener("click", () => busy($("queue-more"), () => refresh(true)));
  $("refresh").addEventListener("click", () => busy($("refresh"), refresh));
  $("sign-out").addEventListener("click", () => busy($("sign-out"), async () => { await request("logout", {}); location.assign(endpoint); }));
  function resetIntake() {
    const form = $("intake-form"); form.reset(); const kind = form.elements.kind;
    kind.value = [...kind.options].find(option => !option.disabled)?.value ?? "word";
  }
  $("intake-open").addEventListener("click", () => { resetIntake(); $("intake-dialog").showModal(); });
  $("intake-close").addEventListener("click", () => $("intake-dialog").close());
  $("intake-form").addEventListener("submit", event => {
    event.preventDefault(); const form = event.currentTarget;
    busy(form.querySelector('[type="submit"]'), async () => {
      const fields = new FormData(form);
      const result = await command({ action: "intake", command_id: crypto.randomUUID(), kind: fields.get("kind"), external_id: fields.get("external_id"),
        expected_version_id: fields.get("expected_version_id") || null, title: fields.get("title"), payload: JSON.parse(fields.get("payload")) });
      $("intake-dialog").close(); resetIntake(); message("Research copy submitted; all reviews pending.");
      await refresh(); await open(result.candidate_id);
    });
  });
  (async () => {
    try {
      session = await request("session"); $("session-label").textContent = "Authenticated editorial session";
      $("tab-people").hidden = !session.is_administrator;
      $("intake-open").hidden = !session.capabilities.some(g => g.scope === "intake");
      if (granted("article", "intake")) {
        const prepared = node("button", "Import prepared Articles"); prepared.type = "button";
        prepared.addEventListener("click", preparedArticleImport); $("intake-open").after(prepared);
      }
      const kind = $("intake-form").elements.kind;
      for (const option of kind.options) option.disabled = !granted(option.value, "intake");
      kind.value = [...kind.options].find(o => !o.disabled)?.value ?? "word";
      await refresh();
    } catch (error) { message(error.message); }
  })();
})();
