import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  return new NextResponse(
    `
    <!doctype html>
    <html>
      <head>
        <title>Temporarily Offline</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: #0f172a;
            color: white;
            text-align: center;
            padding: 24px;
          }
          .box { max-width: 650px; }
          h1 { margin-bottom: 12px; }
          p { color: #cbd5e1; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>Drishvara is temporarily offline</h1>
          <p>We are currently working on pipeline improvements and deployment hardening.</p>
          <p>Please check back later.</p>
        </div>
      </body>
    </html>
    `,
    {
      status: 503,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store, no-cache, must-revalidate"
      }
    }
  );
}

export const config = {
  matcher: "/:path*"
};
