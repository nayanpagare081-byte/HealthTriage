import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js Dynamic API Proxy Route Handler
 * 
 * Bridges client requests to the internal FastAPI backend service using the Vercel
 * service binding (process.env.BACKEND_URL), falling back to NEXT_PUBLIC_API_URL or
 * local default for independent development.
 */
function getBackendBaseUrl(): string {
  const url = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const baseUrl = getBackendBaseUrl();
  const targetUrl = new URL(`/api/${pathStr}`, baseUrl);
  targetUrl.search = request.nextUrl.search;

  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: request.headers.get("accept") || "application/json",
      },
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": contentType || "text/plain" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        detail: `Failed to connect to backend service at ${baseUrl}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const baseUrl = getBackendBaseUrl();
  const targetUrl = new URL(`/api/${pathStr}`, baseUrl);

  try {
    const body = await request.json();
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: request.headers.get("accept") || "application/json",
      },
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": contentType || "text/plain" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        detail: `Failed to connect to backend service at ${baseUrl}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 502 }
    );
  }
}
