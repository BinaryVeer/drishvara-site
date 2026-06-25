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
        limit: "1"
      })
    );

    if (manifests.length !== 1) {
      return governedError(
        "active_release_unavailable",
        "No single active governed Panchang release is available.",
        503
      );
    }

    const manifest = manifests[0];
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
          limit: "1"
        })
      );
      if (exactRows.length === 1) {
        const runtimeResult = exactRows[0].payload?.["runtime_result"];
        if (runtimeResult && typeof runtimeResult === "object") {
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
      status: "sup01_governed_runtime_response",
      release: {
        release_id: manifest.release_id,
        manifest_content_hash: manifest.content_hash,
        activated_at: manifest.activated_at
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
      public_ui_cutover_active: false,
      next_cutover_stage: "SUP02"
    });
  } catch (error) {
    console.error("SUP01 calculate-panchang failure", error);
    return governedError(
      "runtime_failure",
      "The governed Panchang runtime could not complete this request.",
      500
    );
  }
});
