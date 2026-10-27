/* Generic shell only. All drafts, grants and decisions come from the authenticated service. */
(() => {
  "use strict";
  const endpoint = "/api/editorial-workspace";
  const $ = id => document.getElementById(id);
  let session = null, selected = null, items = [], loadSequence = 0;
  const node = (tag, text, cls) => { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; };
  const message = text => { $("message").textContent = text; };
  async function request(action, body) {
    const response = await fetch(endpoint + "?action=" + action, {
      method: body === undefined ? "GET" : "POST", credentials: "same-origin", cache: "no-store",
      ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.code || "editorial_request_denied");
    return data;
  }
  const command = body => request("command", body);
  const granted = (kind, scope) => session?.capabilities?.some(g => g.kind === kind && g.scope === scope);
  async function busy(button, work) {
    button.disabled = true;
    try { await work(); } catch (error) { message(error.message); } finally { button.disabled = false; }
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
    const side = $("review"); side.replaceChildren(node("h2", "Review & Clearance"));
    const list = node("ul", undefined, "scope-list");
    for (const scope of data.review_state.required_scopes) list.append(node("li", scope.replaceAll("_", " ") + ": " + (data.review_state.approved_scopes.includes(scope) ? "Approved" : "Pending"), data.review_state.approved_scopes.includes(scope) ? "complete" : ""));
    side.append(list);
    const scopes = data.review_state.required_scopes.filter(scope => granted(data.candidate.kind, scope));
    if (scopes.length) {
      const form = node("form", undefined, "review-form");
      const scope = node("select"), decision = node("select"), note = node("textarea"), refs = node("textarea");
      for (const name of scopes) scope.append(new Option(name.replaceAll("_", " "), name));
      for (const [value, label] of [["revise", "Request revision"], ["reject", "Reject"], ["approve", "Approve exact copy"]]) decision.append(new Option(label, value));
      note.required = true; note.maxLength = 6000; note.rows = 3; refs.rows = 3;
      for (const [label, input] of [["Review scope", scope], ["Decision", decision], ["Rationale", note], ["Evidence references, one per line", refs]]) { const l = node("label", label); l.append(input); form.append(l); }
      const submit = node("button", "Record decision", "primary"); submit.type = "submit"; form.append(submit);
      form.addEventListener("submit", event => { event.preventDefault(); busy(submit, async () => {
        if (!confirm("Record this decision for the displayed immutable copy?")) return;
        await command({ action: "decision", command_id: crypto.randomUUID(), candidate_id: data.candidate.id, version_id: data.version.id, content_hash: data.version.content_hash,
          scope: scope.value, decision: decision.value, note: note.value, evidence_refs: refs.value.split("\n").map(s => s.trim()).filter(Boolean) });
        message("Decision recorded for this version. Publication remains separately controlled."); await refresh();
      }); });
      side.append(form);
    }
    if (granted(data.candidate.kind, "release")) {
      const release = node("button", "Request controlled release"); release.disabled = !data.review_state.reviews_complete;
      release.addEventListener("click", () => busy(release, async () => {
        if (!confirm("Create a handoff request? This will not publish content.")) return;
        const receipt = await command({ action: "request_release", command_id: crypto.randomUUID(), candidate_id: data.candidate.id, version_id: data.version.id, content_hash: data.version.content_hash });
        message(receipt.status); await open(id);
      })); side.append(release);
    }
    side.append(node("p", "Review acceptance does not publish a word or article. Existing publisher validation and operational authorization remain required.", "muted"));
  }
  $("kind-filter").addEventListener("change", renderQueue);
  $("refresh").addEventListener("click", () => busy($("refresh"), refresh));
  $("sign-out").addEventListener("click", () => busy($("sign-out"), async () => { await request("logout", {}); location.assign(endpoint); }));
  $("intake-open").addEventListener("click", () => $("intake-dialog").showModal());
  $("intake-close").addEventListener("click", () => $("intake-dialog").close());
  $("intake-form").addEventListener("submit", event => {
    event.preventDefault(); const form = event.currentTarget;
    busy(form.querySelector('[type="submit"]'), async () => {
      const fields = new FormData(form);
      const result = await command({ action: "intake", command_id: crypto.randomUUID(), kind: fields.get("kind"), external_id: fields.get("external_id"),
        expected_version_id: fields.get("expected_version_id") || null, title: fields.get("title"), payload: JSON.parse(fields.get("payload")) });
      $("intake-dialog").close(); form.reset(); message("Research copy submitted; all reviews pending.");
      await refresh(); await open(result.candidate_id);
    });
  });
  (async () => {
    try {
      session = await request("session"); $("session-label").textContent = "Authenticated editorial session";
      $("intake-open").hidden = !session.capabilities.some(g => g.scope === "intake");
      const kind = $("intake-form").elements.kind;
      for (const option of kind.options) option.disabled = !granted(option.value, "intake");
      kind.value = [...kind.options].find(o => !o.disabled)?.value ?? "word";
      await refresh();
    } catch (error) { message(error.message); }
  })();
})();
