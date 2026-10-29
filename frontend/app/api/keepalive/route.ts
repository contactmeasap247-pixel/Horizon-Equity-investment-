import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getBackendBaseUrl(): string {
  let url = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (!url || url.includes("localhost") || url.includes("127.0.0.1")) {
    url = "https://horizon-equity-backend.onrender.com";
  }
  if (url.startsWith("http://") && !url.includes("localhost") && !url.includes("127.0.0.1")) {
    url = "https://" + url.slice(7);
  }
  return url.replace(/\/api\/v1\/?$/, "").replace(/\/api\/?$/, "").replace(/\/+$/, "");
}

export async function GET() {
  const baseUrl = getBackendBaseUrl();
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(`${baseUrl}/health`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "User-Agent": "HorizonEquity-Frontend-KeepAlive/1.0",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    // Fire-and-forget database pool readiness warm-up
    fetch(`${baseUrl}/health/ready`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "User-Agent": "HorizonEquity-Frontend-KeepAlive/1.0",
      },
    }).catch(() => {});

    const latencyMs = Date.now() - start;

    return NextResponse.json(
      {
        status: res.ok ? "awake" : "warming",
        backend_status: res.status,
        latency_ms: latencyMs,
        timestamp: new Date().toISOString(),
      },
      {
        status: res.ok ? 200 : 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    const latencyMs = Date.now() - start;
    return NextResponse.json(
      {
        status: "waking",
        latency_ms: latencyMs,
        message: error instanceof Error ? error.message : "Backend waking from idle sleep",
        timestamp: new Date().toISOString(),
      },
      {
        status: 202,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}

