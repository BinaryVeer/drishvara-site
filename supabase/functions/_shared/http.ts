export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store"
};

export function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      ...extraHeaders,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

export function governedError(
  code: string,
  message: string,
  status = 400,
  details: Record<string, unknown> = {}
): Response {
  return jsonResponse(
    {
      status: "governed_error",
      error: {
        code,
        message,
        ...details
      },
      persistence_performed: false
    },
    status
  );
}
