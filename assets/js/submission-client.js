(function () {
  const BACKEND_SUBMISSION_ENABLED = false;
  const SUPABASE_INSERT_ENABLED = false;
  const PALM_IMAGE_UPLOAD_ENABLED = false;
  const STORAGE_MODE = "local_prepare_only";

  function byId(id) {
    return document.getElementById(id);
  }

  function value(id) {
    return byId(id)?.value?.trim() || "";
  }

  function checked(id) {
    return Boolean(byId(id)?.checked);
  }

  function buildSafePacket() {
    return {
      version: "2026.04.30-b20d",
      source: "drishvara_submission_client_scaffold",
      storage_mode: STORAGE_MODE,
      backend_submission_enabled: BACKEND_SUBMISSION_ENABLED,
      supabase_insert_enabled: SUPABASE_INSERT_ENABLED,
      palm_image_upload_enabled: PALM_IMAGE_UPLOAD_ENABLED,
      submission_type: value("submissionType"),
      name: value("name"),
      email: value("email"),
      preferred_language: value("language"),
      location: value("location"),
      message: value("message"),
      consent_to_process: checked("consent"),
      consent_to_contact: false,
      review_status: "pending_future_backend",
      monthly_review_day: 10,
      created_at_local: new Date().toISOString(),
      guardrails: [
        "This packet is prepared locally in the browser.",
        "No backend write is performed in B20D.",
        "Palm image upload remains disabled.",
        "Submission requires future authenticated backend intake before storage."
      ]
    };
  }

  function setStatus(message) {
    const target =
      byId("submissionBackendStatus") ||
      document.querySelector("[data-submission-backend-status]");

    if (!target) return;

    target.textContent = message;
  }

  function updatePreviewFromClient() {
    const preview = byId("preview");
    if (!preview) return;

    const packet = buildSafePacket();
    preview.textContent = JSON.stringify(packet, null, 2);

    const mailto = byId("mailtoLink");
    if (mailto) {
      const body = encodeURIComponent([
        "Drishvara Submission",
        "",
        JSON.stringify(packet, null, 2)
      ].join("\n"));

      mailto.href = "mailto:contact@drishvara.com?subject=Drishvara%20Submission&body=" + body;
    }
  }

  function attachSafeSubmitButton() {
    const prepareBtn = byId("prepareBtn");
    if (!prepareBtn) return;

    prepareBtn.setAttribute("data-backend-write-enabled", "false");
    prepareBtn.setAttribute("data-supabase-insert-enabled", "false");
  }

  function disablePalmUpload() {
    const palmInput = byId("palmImage");
    if (!palmInput) return;

    palmInput.disabled = true;
    palmInput.setAttribute("data-upload-enabled", "false");
    palmInput.setAttribute("aria-disabled", "true");
  }

  function boot() {
    setStatus("Backend intake: disabled · Local preparation only");
    disablePalmUpload();
    attachSafeSubmitButton();

    window.DrishvaraSubmissionIntake = {
      version: "2026.04.30-b20d",
      backendSubmissionEnabled: BACKEND_SUBMISSION_ENABLED,
      supabaseInsertEnabled: SUPABASE_INSERT_ENABLED,
      palmImageUploadEnabled: PALM_IMAGE_UPLOAD_ENABLED,
      storageMode: STORAGE_MODE,
      buildSafePacket,
      updatePreviewFromClient
    };
  }

  window.addEventListener("load", boot);
})();
