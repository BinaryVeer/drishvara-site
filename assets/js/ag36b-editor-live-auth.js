(function () {
  const statusEl = document.querySelector("[data-ag36b-status]");
  const form = document.getElementById("editor-login-preview");
  const emailInput = document.getElementById("editor-email");
  const passwordInput = document.getElementById("editor-password");
  const submitButton = document.querySelector("[data-ag36b-submit]");
  const signOutButton = document.querySelector("[data-ag36b-signout]");
  const successPath = "/editor-dashboard.html";

  function setStatus(message, kind = "info") {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.setAttribute("data-kind", kind);
  }

  function setBusy(isBusy) {
    if (submitButton) {
      submitButton.disabled = isBusy;
      submitButton.textContent = isBusy ? "Checking Editor access…" : "Sign in as Editor";
    }
  }

  function getConfig() {
    return window.DRISHVARA_AUTH_CONFIG || null;
  }

  function configReady(config) {
    return Boolean(
      config &&
      config.supabaseUrl &&
      config.supabaseAnonKey &&
      !String(config.supabaseUrl).includes("PASTE_") &&
      !String(config.supabaseAnonKey).includes("PASTE_")
    );
  }

  function getSupabaseClient() {
    const config = getConfig();
    if (!configReady(config)) {
      throw new Error("Local Supabase browser config is missing. Create assets/js/drishvara-auth-local.js from the example template.");
    }
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      throw new Error("Supabase browser library did not load.");
    }
    return window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
  }

  async function verifyEditorProfile(client, userEmail) {
    const { data, error } = await client
      .from("profiles")
      .select("email, role, is_active")
      .eq("email", userEmail)
      .eq("role", "editor")
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw new Error(error.message || "Could not verify Editor profile.");
    if (!data) throw new Error("Login succeeded, but active Editor profile was not found.");
    return data;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);

    try {
      const client = getSupabaseClient();
      const email = (emailInput?.value || "").trim();
      const password = passwordInput?.value || "";

      if (!email || !password) {
        throw new Error("Enter Editor email and password.");
      }

      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message || "Editor login failed.");
      if (!data?.user?.email) throw new Error("Editor login returned no user email.");

      await verifyEditorProfile(client, data.user.email);

      setStatus("Editor login successful. Active Editor profile verified.", "success");
      window.location.href = (getConfig()?.editorSuccessPath || successPath);
    } catch (error) {
      setStatus(error.message || "Editor login failed.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    try {
      const client = getSupabaseClient();
      await client.auth.signOut();
      setStatus("Signed out locally.", "info");
    } catch (error) {
      setStatus(error.message || "Sign out failed.", "error");
    }
  }

  function boot() {
    const config = getConfig();

    if (!configReady(config)) {
      setStatus("Local Auth config missing. Create assets/js/drishvara-auth-local.js from the example template.", "warning");
    } else {
      setStatus("Local Supabase Auth config detected. Editor login test is ready.", "success");
    }

    if (emailInput) {
      emailInput.value = config?.editorEmail || "vikash4world@gmail.com";
    }

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Sign in as Editor";
      submitButton.style.cursor = "pointer";
      submitButton.style.opacity = "1";
    }

    form?.addEventListener("submit", handleSubmit);
    signOutButton?.addEventListener("click", handleSignOut);
  }

  window.addEventListener("load", boot);
})();
