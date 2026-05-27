(function () {
  const requiredRole = document.body?.getAttribute("data-required-role");
  const statusEl = document.querySelector("[data-route-guard-status]");

  function setStatus(message, kind = "info") {
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.setAttribute("data-kind", kind);
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

  function deny(message, redirectPath) {
    setStatus(message, "error");
    document.body.setAttribute("data-route-access", "denied");
    const main = document.querySelector("main");
    if (main) main.style.display = "none";

    const fallback = document.createElement("section");
    fallback.style.maxWidth = "760px";
    fallback.style.margin = "80px auto";
    fallback.style.padding = "28px";
    fallback.style.border = "1px solid rgba(250, 204, 21, 0.35)";
    fallback.style.borderRadius = "24px";
    fallback.style.background = "rgba(15, 23, 42, 0.9)";
    fallback.style.color = "#fff";
    fallback.innerHTML = `
      <h1 style="margin-top:0;">Access blocked</h1>
      <p>${message}</p>
      <p style="color:#facc15;font-weight:700;">Required role: ${requiredRole || "unknown"}</p>
      <a href="${redirectPath}" style="color:#93c5fd;font-weight:800;">Go to correct login</a>
    `;
    document.body.appendChild(fallback);
  }

  async function boot() {
    try {
      if (!requiredRole) throw new Error("Route guard missing required role.");

      const config = getConfig();
      if (!configReady(config)) {
        throw new Error("Local Supabase browser config is missing.");
      }
      if (!window.supabase || typeof window.supabase.createClient !== "function") {
        throw new Error("Supabase browser library did not load.");
      }

      const client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
      const { data: sessionData, error: sessionError } = await client.auth.getSession();

      if (sessionError) throw new Error(sessionError.message || "Session check failed.");
      const userEmail = sessionData?.session?.user?.email;

      if (!userEmail) {
        return deny("No active login session found.", requiredRole === "admin" ? "/admin/login.html" : "/editor/login.html");
      }

      const { data: profile, error: profileError } = await client
        .from("profiles")
        .select("email, role, is_active")
        .eq("email", userEmail)
        .eq("role", requiredRole)
        .eq("is_active", true)
        .maybeSingle();

      if (profileError) throw new Error(profileError.message || "Profile role check failed.");
      if (!profile) {
        return deny(
          `Logged-in user ${userEmail} is not permitted to access this ${requiredRole} route.`,
          requiredRole === "admin" ? "/editor-dashboard.html" : "/admin-dashboard.html"
        );
      }

      document.body.setAttribute("data-route-access", "granted");
      setStatus(`${requiredRole} route verified for ${userEmail}.`, "success");
    } catch (error) {
      deny(error.message || "Route access blocked.", requiredRole === "admin" ? "/admin/login.html" : "/editor/login.html");
    }
  }

  window.addEventListener("load", boot);
})();
