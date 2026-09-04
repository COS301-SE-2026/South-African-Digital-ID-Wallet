import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:5118'

const HOP_BY_HOP_HEADERS = [
  'connection',
  'keep-alive',
  'transfer-encoding',
  'te',
  'trailer',
  'upgrade',
  'proxy-authenticate',
  'proxy-authorization',
  'host',
  'content-length',
]

async function proxy(request: NextRequest, path: string[]) {
  const targetUrl = new URL(`${API_INTERNAL_URL}/api/${path.join('/')}`)
  targetUrl.search = request.nextUrl.search

  const headers = new Headers(request.headers)
  HOP_BY_HOP_HEADERS.forEach((h) => headers.delete(h))

  const hasBody = !['GET', 'HEAD'].includes(request.method)

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      redirect: 'manual',
      // @ts-expect-error duplex is required by Node's fetch for streamed bodies, not yet in the TS lib types
      duplex: hasBody ? 'half' : undefined,
    })

    const responseHeaders = new Headers(response.headers)
    HOP_BY_HOP_HEADERS.forEach((h) => responseHeaders.delete(h))

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (err) {
    console.error(`[api-proxy] failed to reach ${targetUrl.toString()}:`, err)
    return new Response(JSON.stringify({ error: 'Upstream request failed' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    })
  }
}

type Ctx = { params: Promise<{ path: string[] }> }

export async function GET(request: NextRequest, { params }: Ctx) {
  return proxy(request, (await params).path)
}
export async function POST(request: NextRequest, { params }: Ctx) {
  return proxy(request, (await params).path)
}
export async function PUT(request: NextRequest, { params }: Ctx) {
  return proxy(request, (await params).path)
}
export async function PATCH(request: NextRequest, { params }: Ctx) {
  return proxy(request, (await params).path)
}
export async function DELETE(request: NextRequest, { params }: Ctx) {
  return proxy(request, (await params).path)
}
export async function OPTIONS(request: NextRequest, { params }: Ctx) {
  return proxy(request, (await params).path)
}
