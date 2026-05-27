(function () {
  const statusEl = document.querySelector("[data-ag36a-status]");
  const form = document.getElementById("admin-login-preview");
  const emailInput = document.getElementById("admin-email");
  const passwordInput = document.getElementById("admin-password");
  const submitButton = document.querySelector("[data-ag36a-submit]");
  const signOutButton = document.querySelector("[data-ag36a-signout]");
  const successPath = "/admin-dashboard.html";

  function setStatus(message, kind = "info") {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.setAttribute("data-kind", kind);
  }

  function setBusy(isBusy) {
    if (submitButton) {
      submitButton.disabled = isBusy;
      submitButton.textContent = isBusy ? "Checking Admin access…" : "Sign in as Admin";
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

  async function verifyAdminProfile(client, userEmail) {
    const { data, error } = await client
      .from("profiles")
      .select("email, role, is_active")
      .eq("email", userEmail)
      .eq("role", "admin")
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw new Error(error.message || "Could not verify Admin profile.");
    if (!data) throw new Error("Login succeeded, but active Admin profile was not found.");
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
        throw new Error("Enter Admin email and password.");
      }

      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message || "Admin login failed.");
      if (!data?.user?.email) throw new Error("Admin login returned no user email.");

      await verifyAdminProfile(client, data.user.email);

      setStatus("Admin login successful. Active Admin profile verified.", "success");
      window.location.href = (getConfig()?.adminSuccessPath || successPath);
    } catch (error) {
      setStatus(error.message || "Admin login failed.", "error");
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
      setStatus("Local Supabase Auth config detected. Admin login test is ready.", "success");
    }

    if (emailInput && config?.adminEmail) {
      emailInput.value = config.adminEmail;
    }

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Sign in as Admin";
      submitButton.style.cursor = "pointer";
      submitButton.style.opacity = "1";
    }

    form?.addEventListener("submit", handleSubmit);
    signOutButton?.addEventListener("click", handleSignOut);
  }

  window.addEventListener("load", boot);
})();
