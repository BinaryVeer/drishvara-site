export type LocationRow = {
  selector_value: string;
  display_label: string;
  timezone: string;
  latitude: number;
  longitude: number;
  search_labels: unknown;
  payload: Record<string, unknown>;
};

export type PanchangRequest = {
  civil_date?: unknown;
  mode?: unknown;
  place?: unknown;
  selector_value?: unknown;
  canonical_place_id?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  timezone?: unknown;
};

export type ResolvedLocation = {
  mode: "named_location" | "coordinates";
  civil_date: string;
  canonical_place_id: string | null;
  selector_value: string | null;
  display_label: string;
  timezone: string;
  latitude: number;
  longitude: number;
  governed_record: LocationRow | null;
  public_selection_approved: boolean;
  computation_approved: boolean;
  persistence_enabled: false;
};

export type ResolutionResult =
  | { ok: true; value: ResolvedLocation }
  | {
      ok: false;
      code: string;
      message: string;
      guide_to_coordinates?: boolean;
    };

const SUPPORTED_START = "1900-01-01";
const SUPPORTED_END = "2100-12-31";

function normalizeLabel(value: unknown): string {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ");
}

function validCivilDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day, 12));
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day &&
    value >= SUPPORTED_START &&
    value <= SUPPORTED_END
  );
}

function validTimezone(timezone: unknown): timezone is string {
  if (typeof timezone !== "string" || timezone.trim() === "") return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: timezone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function finiteNumber(value: unknown): number | null {
  const numberValue =
    typeof value === "number" ? value : Number(String(value ?? "").trim());
  return Number.isFinite(numberValue) ? numberValue : null;
}

function labelsFor(row: LocationRow): string[] {
  const payload = row.payload || {};
  const canonical = payload["canonical_place_id"];
  const payloadLabels = payload["search_labels"];
  const values: unknown[] = [
    row.selector_value,
    row.display_label,
    canonical,
    ...(Array.isArray(row.search_labels) ? row.search_labels : []),
    ...(Array.isArray(payloadLabels) ? payloadLabels : [])
  ];
  return [...new Set(values.map(normalizeLabel).filter(Boolean))];
}

export function resolvePanchangRequest(
  request: PanchangRequest,
  locations: LocationRow[]
): ResolutionResult {
  if (!validCivilDate(request.civil_date)) {
    return {
      ok: false,
      code: "invalid_civil_date",
      message: "Date must be a valid ISO civil date from 1900-01-01 through 2100-12-31."
    };
  }

  const mode =
    request.mode === "coordinates" ? "coordinates" : "named_location";

  if (mode === "coordinates") {
    const latitude = finiteNumber(request.latitude);
    const longitude = finiteNumber(request.longitude);
    if (
      latitude === null ||
      latitude < -90 ||
      latitude > 90 ||
      longitude === null ||
      longitude < -180 ||
      longitude > 180
    ) {
      return {
        ok: false,
        code: "invalid_coordinates",
        message: "Latitude or longitude is outside the supported worldwide coordinate range."
      };
    }
    if (!validTimezone(request.timezone)) {
      return {
        ok: false,
        code: "invalid_iana_timezone",
        message: "Worldwide coordinate calculation requires an explicit validated IANA timezone."
      };
    }
    return {
      ok: true,
      value: {
        mode,
        civil_date: request.civil_date,
        canonical_place_id: null,
        selector_value: null,
        display_label: `${latitude}, ${longitude}`,
        timezone: request.timezone,
        latitude,
        longitude,
        governed_record: null,
        public_selection_approved: true,
        computation_approved: true,
        persistence_enabled: false
      }
    };
  }

  const query = normalizeLabel(
    request.selector_value ?? request.canonical_place_id ?? request.place
  );
  if (!query) {
    return {
      ok: false,
      code: "missing_place",
      message: "Select an approved place or provide coordinates with an explicit IANA timezone.",
      guide_to_coordinates: true
    };
  }

  const match =
    locations.find((row) => labelsFor(row).includes(query)) ?? null;

  if (!match) {
    return {
      ok: false,
      code: "unknown_place",
      message: "The place name is not in the approved gazetteer. Use an approved place or provide coordinates.",
      guide_to_coordinates: true
    };
  }

  const payload = match.payload || {};
  if (
    payload["public_selection_approved"] !== true ||
    payload["computation_approved"] !== true ||
    payload["public_output_allowed"] !== true
  ) {
    return {
      ok: false,
      code: "place_not_approved",
      message: "The governed place record is not approved for public calculation."
    };
  }
  if (!validTimezone(match.timezone)) {
    return {
      ok: false,
      code: "invalid_governed_timezone",
      message: "The governed place record does not contain a valid approved IANA timezone."
    };
  }

  const canonicalPlaceId = String(payload["canonical_place_id"] ?? "").trim();
  if (!canonicalPlaceId) {
    return {
      ok: false,
      code: "missing_canonical_place_id",
      message: "The governed place record is incomplete."
    };
  }

  return {
    ok: true,
    value: {
      mode,
      civil_date: request.civil_date,
      canonical_place_id: canonicalPlaceId,
      selector_value: match.selector_value,
      display_label: match.display_label,
      timezone: match.timezone,
      latitude: Number(match.latitude),
      longitude: Number(match.longitude),
      governed_record: match,
      public_selection_approved: true,
      computation_approved: true,
      persistence_enabled: false
    }
  };
}
