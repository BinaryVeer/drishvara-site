/* Generic shell only. All drafts, grants and decisions come from the authenticated service. */
(() => {
  "use strict";
  const endpoint = "/api/editorial-workspace";
  const $ = id => document.getElementById(id);
  let session = null, selected = null, items = [], loadSequence = 0, view = "review", person = null;
  const node = (tag, text, cls) => { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; };
  const message = text => { $("message").textContent = text; };
  async function request(action, body) {
    const response = await fetch(endpoint + "?action=" + action, {
      method: body === undefined ? "GET" : "POST", credentials: "same-origin", cache: "no-store",
      ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(Array.isArray(data.details) && data.details.length ? data.details.join(" ") : data.code || "editorial_request_denied");
    return data;
  }
  const command = body => request("command", body);
  const granted = (kind, scope) => session?.capabilities?.some(g => g.kind === kind && g.scope === scope);
  const labels = { review: "Review Queue", acceptance: "Acceptance Queue", publishing: "Publishing Queue" };
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
    delivery_readiness_unavailable: "The database delivery-readiness check is unavailable. Delivery remains disabled.",
    release_scope_denied: "A current release permission and candidate assignment are required.",
    queued_delivery_disabled: "Release request saved. Delivery is disabled; nothing was published.",
    queued_worker_unavailable: "Release request saved. The trusted delivery worker is unavailable.",
    delivery_in_progress: "Delivery is already in progress. Refresh before retrying.",
    delivery_completed: "Controlled delivery completed. See the recorded delivery result.",
    invalid_review_checklist: "Select the aspects you actually reviewed. Publisher acceptance is a separate step.",
    invalid_editorial_image: "Use a PNG image up to 96 KiB, 16:9 or 4:3, with alt text, attribution and its source URL.",
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
      b.append(node("small", item.kind + " / " + (item.review_state.reviews_complete ? "Reviews complete" : "Pending review")));
      b.addEventListener("click", () => busy(b, () => open(item.id))); return b;
    }));
    $("empty").hidden = filtered.length !== 0;
  }
  async function refresh() {
    const data = await command({ action: "list" }); items = data.items; renderQueue();
    if (session?.is_administrator) renderAssignmentOptions();
    if (selected) await open(selected.candidate.id);
  }
  function detail(parent, title, value) {
    if (typeof value !== "string" || !value) return;
    const section = node("section", undefined, "content-section"); section.append(node("h3", title), node("p", value, "copy")); parent.append(section);
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
      note.required = !revise; refs.required = !revise && decision.value === "approve"; decision.disabled = revise;
      subject.box.hidden = !needed; subject.ack.required = needed; subject.reason.required = needed;
      if (!needed) { subject.ack.checked = false; subject.reason.value = ""; }
      if (self) { self.box.hidden = revise; self.ack.required = !revise; self.reason.required = !revise; }
      submit.textContent = revise ? "Prepare corrected copy" : "Submit review";
    }
    form.addEventListener("change", sync);
    form.addEventListener("input", () => { note.setCustomValidity(""); refs.setCustomValidity(""); }); sync();
    let pendingCommand = null;
    form.addEventListener("input", () => { pendingCommand = null; });
    form.addEventListener("change", () => { pendingCommand = null; });
    form.addEventListener("submit", event => { event.preventDefault(); busy(submit, async () => {
      if (correction.value === "yes") { if (data.can_edit) correctionEditor(data); else message("An assigned editor or Admin must submit the correction."); return; }
      const chosen = selectedScopes(), evidence = refs.value.split("\n").map(v => v.trim()).filter(Boolean);
      if (!chosen.length) { message("Check at least one aspect you actually reviewed."); return; }
      note.setCustomValidity(note.value.trim() ? "" : "Enter the finding and reason for this decision.");
      refs.setCustomValidity(decision.value === "approve" && !evidence.length ? "Approval requires an actual evidence reference." :
        evidence.length > 50 || evidence.some(v => v.length > 500) ? "Use up to 50 references, each at most 500 characters." :
        new Set(evidence).size !== evidence.length ? "Remove duplicate evidence references." : "");
      if (!form.reportValidity()) return;
      if (!confirm("Record one review for the checked aspects of this exact copy? Unchecked aspects remain unchanged.")) return;
      pendingCommand ??= { action: "review_batch", command_id: crypto.randomUUID(), candidate_id: data.candidate.id,
        version_id: data.version.id, content_hash: data.version.content_hash, scopes: chosen, decision: decision.value,
        note: note.value.trim(), evidence_refs: evidence,
        ...(self ? { admin_exception: { policy_ref: session.self_review_policy_ref, reason: self.reason.value.trim(), acknowledged: self.ack.checked } } : {}),
        ...(needsSubject() ? { subject_review_exception: { policy_ref: session.subject_review_policy_ref, reason: subject.reason.value.trim(), acknowledged: subject.ack.checked } } : {}) };
      await command(pendingCommand); message("Review recorded for the checked aspects. Acceptance and publication remain separate."); await refresh();
    }); });
    side.append(form);
  }
  function correctionEditor(data) {
    const dialog = node("dialog"); dialog.id = "correction-dialog"; dialog.setAttribute("aria-labelledby", "correction-title");
    const form = node("form"), heading = node("div", undefined, "dialog-heading");
    const title = node("h2", "Revise complete copy"); title.id = "correction-title";
    const close = node("button", "\u00d7"); close.type = "button"; close.setAttribute("aria-label", "Close correction editor"); close.addEventListener("click", () => dialog.close());
    heading.append(title, close); form.append(heading, node("p", "This saves a new immutable version. Earlier decisions remain in history but do not approve the revised copy.", "muted"));
    const binding = node("p", data.candidate.external_id + " / Version " + data.version.id, "hash"); form.append(binding);
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
    let upload = payload.media?.[0]?.upload_png ?? null, previewUrl = null, imageLoading = false;
    if (data.candidate.kind === "article") {
      const media = node("fieldset", undefined, "image-correction"); media.append(node("legend", "Picture correction"));
      const mode = field(media, "Change the current picture?", node("select")); mode.name = "image_change";
      for (const [v, t] of [["keep", "No - keep existing image"], ["replace", "Yes - replace or add"], ["remove", "Remove image"]]) mode.append(new Option(t, v));
      const controls = node("div"); controls.hidden = true;
      const ratio = field(controls, "Upload ratio", node("select")); ratio.name = "image_ratio";
      ratio.append(new Option("16:9 - wide hero", "wide"), new Option("4:3 - editorial image", "standard"));
      const file = field(controls, "Upload PNG (up to 96 KiB)", node("input")); file.type = "file"; file.accept = "image/png"; file.name = "image_file";
      const image = node("img"); image.alt = "Private image preview"; image.hidden = true; image.className = "private-image-preview"; controls.append(image);
      const inputs = {};
      for (const [key, label] of [["url", "Existing image URL or uploaded asset path"], ["alt", "Alternative text"], ["attribution", "Image attribution and use basis"], ["source_url", "Image source URL"]]) {
        const input = field(controls, label, node("input")); input.name = "image_" + key; input.value = payload.media[0]?.[key] ?? ""; inputs[key] = input;
      }
      const status = node("p"); status.setAttribute("role", "status"); controls.append(status); media.append(controls); form.append(media);
      mode.addEventListener("change", () => { controls.hidden = mode.value !== "replace"; for (const input of Object.values(inputs)) input.required = mode.value === "replace"; });
      file.addEventListener("change", async () => {
        imageLoading = true;
        upload = null; status.textContent = ""; file.setCustomValidity("");
        if (previewUrl) URL.revokeObjectURL(previewUrl); image.hidden = true; inputs.url.readOnly = false;
        if (!file.files.length) { imageLoading = false; return; }
        try {
          const chosen = file.files[0]; if (chosen.type !== "image/png" || chosen.size > 98304) throw Error("Use a PNG up to 96 KiB.");
          const bytes = await chosen.arrayBuffer(), bitmap = await createImageBitmap(chosen), w = bitmap.width, h = bitmap.height; bitmap.close();
          const r = ratio.value === "wide" ? 16 / 9 : 4 / 3;
          if (w < 320 || w > 2400 || h < 180 || h > 1800 || Math.abs(w / h - r) >= .015) throw Error("Use the selected ratio, width 320-2400px and height 180-1800px.");
          const digest = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map(b => b.toString(16).padStart(2, "0")).join("");
          upload = btoa([...new Uint8Array(bytes)].map(b => String.fromCharCode(b)).join("")); inputs.url.value = "/assets/editorial/" + digest + ".png"; inputs.url.readOnly = true;
          previewUrl = URL.createObjectURL(chosen); image.src = previewUrl; image.hidden = false; status.textContent = w + " x " + h + " - private pending-copy image";
        } catch (error) { status.textContent = error.message; file.setCustomValidity(error.message); }
        finally { imageLoading = false; }
      });
      ratio.addEventListener("change", () => { if (file.files.length) file.dispatchEvent(new Event("change")); });
      form.addEventListener("submit", () => {
        if (mode.value === "remove") payload.media = [];
        if (mode.value === "replace") payload.media = [{ ...Object.fromEntries(Object.entries(inputs).map(([key, input]) => [key, input.value.trim()])), ...(upload ? { upload_png: upload } : {}) }];
      });
    } else form.append(node("p", "Word public copy has no image slot. No image will be added to its publication contract.", "muted"));
    const status = node("p"); status.setAttribute("role", "status"); form.append(status);
    const save = node("button", "Submit corrected copy for review", "primary"); save.type = "submit"; form.append(save);
    let pending = null;
    form.addEventListener("input", () => { pending = null; }); form.addEventListener("change", () => { pending = null; });
    form.addEventListener("submit", event => { event.preventDefault(); busy(save, async () => {
      if (imageLoading) { status.textContent = "Wait for image validation to complete."; return; }
      if (JSON.stringify(payload) === original && titleInput.value === data.version.title) { status.textContent = "No correction was made."; return; }
      if (!confirm("Save this complete revised copy as a new version with fresh reviews required?")) return;
      pending ??= { action: "intake", command_id: crypto.randomUUID(), kind: data.candidate.kind, external_id: data.candidate.external_id,
        expected_version_id: data.version.id, title: titleInput.value.trim(), payload };
      try { await command(pending); } catch (error) { status.textContent = friendly(error.message); throw error; }
      dialog.close(); message("Corrected version submitted. Prior approvals do not apply to this copy."); await refresh();
    }); });
    dialog.append(form); document.body.append(dialog); dialog.addEventListener("close", () => { if (previewUrl) URL.revokeObjectURL(previewUrl); dialog.remove(); }); dialog.showModal();
  }
  async function open(id) {
    const seq = ++loadSequence;
    const data = await command({ action: "open", candidate_id: id });
    if (seq !== loadSequence) return;
    selected = data; renderQueue();
    const doc = $("document"), p = data.version.payload;
    doc.replaceChildren(node("h2", data.version.title), node("p", data.candidate.external_id, "muted"), node("p", data.version.content_hash, "hash"));
    doc.append(node("p", "Version: " + data.version.id, "version-label"));
    if (data.can_edit) {
      const edit = node("button", "Propose corrected version"); edit.type = "button";
      edit.addEventListener("click", () => correctionEditor(data)); doc.append(edit);
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
    } else { detail(doc, p.desk, p.body); }
    const raw = node("details"), summary = node("summary", "Full immutable copy & evidence"), pre = node("pre", JSON.stringify(p, null, 2));
    raw.append(summary, pre); doc.append(raw);
    const history = node("details"); history.append(node("summary", "Decision & release history"), node("pre", JSON.stringify({ decisions: data.decisions, release_requests: data.release_requests }, null, 2))); doc.append(history);
    const side = $("review"); side.replaceChildren(node("h2", view === "acceptance" ? "Publisher Acceptance" : view === "publishing" ? "Controlled Publication" : "Review & Clearance"));
    const list = node("ul", undefined, "scope-list");
    for (const scope of data.review_state.required_scopes) list.append(node("li", scope.replaceAll("_", " ") + ": " + (data.review_state.approved_scopes.includes(scope) ? "Approved" : "Pending"), data.review_state.approved_scopes.includes(scope) ? "complete" : ""));
    side.append(list);
    const scopes = data.review_state.required_scopes.filter(scope => granted(data.candidate.kind, scope) &&
      (view === "review" ? scope !== "publisher_acceptance" : view === "acceptance" && scope === "publisher_acceptance"));
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
      const submit = node("button", "Record decision", "primary"); submit.type = "submit"; form.append(submit);
      form.addEventListener("submit", event => { event.preventDefault(); busy(submit, async () => {
        const evidence = refs.value.split("\n").map(s => s.trim()).filter(Boolean);
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
      const release = node("button", "Request controlled release"); release.disabled = data.candidate.kind === "word" || !data.review_state.reviews_complete || data.review_permissions?.can_request_release === false;
      releaseButton = release;
      let releaseCommand = null;
      release.addEventListener("click", () => busy(release, async () => {
        if (!confirm("Request controlled release of this exact copy? An activated worker may deliver fully approved content. Word selection remains governed by the existing daily engine.")) return;
        releaseCommand ??= { action: "request_release", command_id: crypto.randomUUID(), candidate_id: data.candidate.id, version_id: data.version.id, content_hash: data.version.content_hash };
        const receipt = await request("release", releaseCommand);
        message(friendly(receipt.status) + (receipt.code ? " " + friendly(receipt.code) : "") +
          (receipt.delivery ? " " + (receipt.delivery.status === "eligible_for_daily_selection" ? "Word is eligible in the daily bank, not forced onto today's card." : "Article commit recorded; deployment readiness remains separate.") : ""));
        await open(id);
      })); side.append(release);
    }
    side.append(node("p", "Review acceptance does not publish a word or article. Existing publisher validation and operational authorization remain required.", "muted"));
  }
  async function activate(next) {
    if (next === "people" && !session?.is_administrator) return;
    view = next;
    for (const tab of document.querySelectorAll("[data-view]")) { const active = tab.dataset.view === next; tab.setAttribute("aria-selected", String(active)); tab.tabIndex = active ? 0 : -1; }
    $("content-panel").hidden = next === "people"; $("people-panel").hidden = next !== "people";
    $("content-panel").setAttribute("aria-labelledby", "tab-" + next);
    if (next === "people") await loadPeople();
    else { $("queue-heading").textContent = labels[next]; if (selected) { $("review").replaceChildren(node("h2", labels[next])); await open(selected.candidate.id); } }
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
  function renderAssignmentOptions() {
    const select = $("assignment-form").elements.candidate_id;
    select.replaceChildren(...items.map(item => new Option(item.title + " / " + item.kind, item.id)));
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
  $("kind-filter").addEventListener("change", renderQueue);
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
      const kind = $("intake-form").elements.kind;
      for (const option of kind.options) option.disabled = !granted(option.value, "intake");
      kind.value = [...kind.options].find(o => !o.disabled)?.value ?? "word";
      await refresh();
    } catch (error) { message(error.message); }
  })();
})();
