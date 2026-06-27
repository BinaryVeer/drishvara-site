import { corsHeaders, governedError, jsonResponse } from "../_shared/http.ts";
import {
  PanchangRequest,
  resolvePanchangRequest,
  type LocationRow
} from "../_shared/location-resolution.ts";
import { calculatePanchangDay } from "../_shared/panchang-runtime.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

function restUrl(path: string, params: URLSearchParams): string {
  return `${supabaseUrl.replace(/\/$/, "")}/rest/v1/${path}?${params.toString()}`;
}

async function restGet<T>(
  path: string,
  params: URLSearchParams
): Promise<T[]> {
  const response = await fetch(restUrl(path, params), {
    method: "GET",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: "application/json"
    }
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase read failed for ${path}: ${response.status} ${body}`);
  }
  return (await response.json()) as T[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasCompletePublicPanchangResult(
  value: Record<string, unknown>
): boolean {
  const sunrise = isRecord(value["sunrise"]) ? value["sunrise"] : null;
  const vara = isRecord(value["vara"]) ? value["vara"] : null;
  const elements = isRecord(value["elements"]) ? value["elements"] : null;

  if (
    !sunrise ||
    typeof sunrise["local"] !== "string" ||
    sunrise["local"].length === 0 ||
    !vara ||
    typeof vara["english"] !== "string" ||
    vara["english"].length === 0 ||
    typeof vara["sanskrit"] !== "string" ||
    vara["sanskrit"].length === 0 ||
    typeof value["paksha"] !== "string" ||
    value["paksha"].length === 0 ||
    !elements
  ) {
    return false;
  }

  return ["tithi", "nakshatra", "yoga", "karana"].every((key) => {
    const element = isRecord(elements[key]) ? elements[key] : null;
    if (!element) return false;
    return (
      typeof element["name"] === "string" &&
      String(element["name"]).length > 0 &&
      Number.isInteger(element["index"])
    );
  });
}

function normalizePrecomputedRuntimeResult(
  value: unknown
): Record<string, unknown> | null {
  if (!isRecord(value)) return null;

  if (value["available"] === true || value["available"] === false) {
    return value;
  }

  if (!hasCompletePublicPanchangResult(value)) {
    return null;
  }

  return {
    ...value,
    available: true
  };
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return governedError("method_not_allowed", "Use POST for Panchang calculation.", 405);
  }
  if (!supabaseUrl || !serviceRoleKey) {
    return governedError(
      "server_configuration_unavailable",
      "The governed Panchang runtime is not configured.",
      503
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 16384) {
    return governedError("request_too_large", "The calculation request is too large.", 413);
  }

  let body: PanchangRequest;
  try {
    body = (await request.json()) as PanchangRequest;
  } catch {
    return governedError("invalid_json", "Provide a valid JSON calculation request.");
  }

  try {
    const manifests = await restGet<{
      release_id: string;
      status: string;
      content_hash: string;
      activated_at: string | null;
    }>(
      "drishvara_release_manifests",
      new URLSearchParams({
        select: "release_id,status,content_hash,activated_at",
        status: "eq.active",
        order: "activated_at.desc",
        limit: "2"
      })
    );

    if (manifests.length !== 1) {
      return governedError(
        "active_release_unavailable",
        "No single active governed Panchang release is available.",
        503
      );
    }

    const runtimeReleases = await restGet<{
      runtime_release_id: string;
      release_id: string;
      status: string;
      no_input_persistence: boolean;
      public_ui_cutover_active: boolean;
      content_hash: string;
      activated_at: string | null;
    }>(
      "drishvara_panchang_runtime_releases",
      new URLSearchParams({
        select:
          "runtime_release_id,release_id,status,no_input_persistence,public_ui_cutover_active,content_hash,activated_at",
        status: "eq.active",
        order: "activated_at.desc",
        limit: "2"
      })
    );

    if (runtimeReleases.length !== 1) {
      return governedError(
        "active_runtime_release_unavailable",
        "No single active governed Panchang runtime release is available.",
        503
      );
    }

    const manifest = manifests[0];
    const runtimeRelease = runtimeReleases[0];

    if (
      runtimeRelease.release_id !== manifest.release_id ||
      runtimeRelease.no_input_persistence !== true
    ) {
      return governedError(
        "runtime_release_contract_mismatch",
        "The active runtime release does not match the governed source release or privacy contract.",
        503
      );
    }

    const locations = await restGet<LocationRow>(
      "drishvara_panchang_locations",
      new URLSearchParams({
        select:
          "selector_value,display_label,timezone,latitude,longitude,search_labels,payload",
        release_id: `eq.${manifest.release_id}`,
        order: "selector_value.asc"
      })
    );

    const resolution = resolvePanchangRequest(body, locations);
    if (!resolution.ok) {
      return governedError(
        resolution.code,
        resolution.message,
        422,
        resolution.guide_to_coordinates
          ? { guide_to_coordinates: true }
          : {}
      );
    }

    const resolved = resolution.value;
    let panchangSource = "approved_server_calculation";
    let panchangResult: unknown = null;
    let sourceContentHash: string | null = null;

    if (resolved.canonical_place_id) {
      const exactRows = await restGet<{
        payload: Record<string, unknown>;
        content_hash: string;
      }>(
        "drishvara_panchang_daily_records",
        new URLSearchParams({
          select: "payload,content_hash",
          release_id: `eq.${manifest.release_id}`,
          canonical_place_id: `eq.${resolved.canonical_place_id}`,
          civil_date: `eq.${resolved.civil_date}`,
          limit: "2"
        })
      );

      if (exactRows.length > 1) {
        return governedError(
          "non_unique_precomputed_record",
          "More than one governed daily record matches this request.",
          503
        );
      }

      if (exactRows.length === 1) {
        const runtimeResult = normalizePrecomputedRuntimeResult(
          exactRows[0].payload?.["runtime_result"]
        );
        if (runtimeResult) {
          panchangSource = "approved_precomputed_record";
          panchangResult = runtimeResult;
          sourceContentHash = exactRows[0].content_hash;
        }
      }
    }

    if (!panchangResult) {
      panchangResult = calculatePanchangDay({
        civil_date: resolved.civil_date,
        timezone: resolved.timezone,
        latitude: resolved.latitude,
        longitude: resolved.longitude
      });
    }

    const observanceRows = await restGet<{
      payload: Record<string, unknown>;
      content_hash: string;
    }>(
      "drishvara_festival_observances",
      new URLSearchParams({
        select: "payload,content_hash",
        release_id: `eq.${manifest.release_id}`,
        civil_date: `eq.${resolved.civil_date}`,
        order: "observance_key.asc"
      })
    );

    return jsonResponse({
      status: runtimeRelease.public_ui_cutover_active
        ? "sup02_governed_public_runtime_response"
        : "sup02_governed_runtime_ready_cutover_inactive",
      release: {
        release_id: manifest.release_id,
        manifest_content_hash: manifest.content_hash,
        activated_at: manifest.activated_at
      },
      runtime: {
        runtime_release_id: runtimeRelease.runtime_release_id,
        runtime_content_hash: runtimeRelease.content_hash,
        status: runtimeRelease.status,
        activated_at: runtimeRelease.activated_at,
        no_input_persistence: runtimeRelease.no_input_persistence,
        public_ui_cutover_active: runtimeRelease.public_ui_cutover_active
      },
      request: {
        mode: resolved.mode,
        civil_date: resolved.civil_date
      },
      location_basis: {
        canonical_place_id: resolved.canonical_place_id,
        selector_value: resolved.selector_value,
        display_label: resolved.display_label,
        timezone: resolved.timezone,
        latitude: resolved.latitude,
        longitude: resolved.longitude,
        automatic_place_substitution_performed: false,
        automatic_timezone_substitution_performed: false
      },
      panchang: {
        source: panchangSource,
        source_content_hash: sourceContentHash,
        result: panchangResult
      },
      observances: observanceRows.map((row) => ({
        content_hash: row.content_hash,
        record: row.payload
      })),
      privacy: {
        calculation_request_persisted: false,
        location_input_persisted: false,
        personal_data_persisted: false
      },
      public_ui_cutover_active: runtimeRelease.public_ui_cutover_active,
      next_cutover_stage: runtimeRelease.public_ui_cutover_active ? null : "SUP02"
    });
  } catch (error) {
    console.error("SUP02 calculate-panchang failure", error);
    return governedError(
      "runtime_failure",
      "The governed Panchang runtime could not complete this request.",
      500
    );
  }
});
