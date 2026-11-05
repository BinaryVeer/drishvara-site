// Authorized cutover: preserve legacy implementations, but never dispatch public/job requests to them.
export function legacyPublicationRetired(_req, res) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(410).json({ ok: false, code: "legacy_publication_retired", editorial_path: "/editorial",
    public_output_allowed: false, runtime_activation: false });
}
