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
    approved_word_registration_pending: "This exact copy still needs registration in the existing approved AG70E bank.",
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
      edit.addEventListener("click", () => {
        const form = $("intake-form"); form.reset(); form.elements.kind.value = data.candidate.kind;
        form.elements.external_id.value = data.candidate.external_id; form.elements.title.value = data.version.title;
        form.elements.expected_version_id.value = data.version.id; form.elements.payload.value = JSON.stringify(p, null, 2);
        $("intake-dialog").showModal();
      }); doc.append(edit);
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
    if (scopes.length && canReview) {
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
        if (result.delivery_enabled) {
          deliveryStatus.textContent = data.candidate.kind === "article" ?
            "Article publishing is connected. Only the exact fully approved copy can be delivered to the public site." :
            "The daily Word handoff is connected. Approved AG70E registration and the independent daily publication controls still apply.";
          if (releaseButton) releaseButton.textContent = data.candidate.kind === "article" ? "Publish approved article" : "Release to daily Word workflow";
        }
        if (result.delivery_enabled && result.request_allowed) readiness.append(node("p", "Ready for controlled delivery validation."));
      })); side.append(readiness, check);
    }
    if (granted(data.candidate.kind, "release") && view === "publishing") {
      const release = node("button", "Request controlled release"); release.disabled = !data.review_state.reviews_complete || data.review_permissions?.can_request_release === false;
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
