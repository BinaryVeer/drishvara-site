// Drishvara local browser Auth config template.
// Copy this file to: assets/js/drishvara-auth-local.js
// Then fill only browser-safe public values from Supabase.
// Never paste service-role keys here.
// Never commit assets/js/drishvara-auth-local.js; it is gitignored.

window.DRISHVARA_AUTH_CONFIG = {
  supabaseUrl: "PASTE_SUPABASE_PROJECT_URL_HERE",
  supabaseAnonKey: "PASTE_SUPABASE_ANON_PUBLIC_KEY_HERE",
  adminEmail: "dwivedi.vikash.vaibhav@gmail.com",
  adminSuccessPath: "/admin-dashboard.html"
};
