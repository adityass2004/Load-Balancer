import axios from 'axios';
import { Server } from '@/types/domain';
import type { RequestPayload } from './body-policy';
import { getSafeAgents, assertLiteralIpAllowed, SsrfBlockedError, getBackendConnectTimeoutMs } from '@/lib/security/ssrf-guard';
import {
  sanitizeRequestHeaders,
  sanitizeResponseHeaders,
  type RequestHeaderContext,
} from './header-policy';

export function buildUpstreamUrl(serverUrl: string, backendPath: string): string {
  const incomingUrl = new URL(backendPath, 'http://proxy.internal');
  const backendUrl = new URL(serverUrl);

  // Parse only the caller-provided backend path. The synthetic base is used
  // for relative URL parsing and is never used as the upstream origin.
  const backendBasePath = backendUrl.pathname.replace(/\/+$/, '');
  const incomingPath = incomingUrl.pathname.startsWith('/')
    ? incomingUrl.pathname
    : `/${incomingUrl.pathname}`;
  backendUrl.pathname = `${backendBasePath}${incomingPath}` || '/';
  backendUrl.search = incomingUrl.search;
  backendUrl.hash = '';

  return backendUrl.toString();
}

export class RequestForwarder {
  async forward(
    server: Server,
    request: Request,
    timeoutMs: number,
    backendPath: string,
    payload?: RequestPayload,
    ctx?: RequestHeaderContext & { nextHop?: number }
  ): Promise<Response> {
    const targetUrl = buildUpstreamUrl(server.url, backendPath);

    // ── B7: Connect-time literal-IP pre-check ──────────────────────────────
    // Node does NOT call the dns.lookup function for literal IPs, so we must
    // classify them here before handing the URL to axios.
    try {
      assertLiteralIpAllowed(targetUrl, server.id);
    } catch (err) {
      if (err instanceof SsrfBlockedError) {
        // Surface as a gateway error — identical error path to any connection failure.
        // RetryService will count it as a backend failure and return 502.
        throw Object.assign(
          new Error('Bad Gateway: upstream request blocked'),
          { code: 'SSRF_BLOCKED', isSsrfBlocked: true }
        );
      }
      throw err;
    }

    // ── Get guarded agents (connect-time DNS guard for hostnames + redirect hops) ──
    const { httpAgent, httpsAgent } = getSafeAgents(server.id);

    // ── HIGH-04 Header Sanitization ─────────────────────────────────────────
    const context: RequestHeaderContext = {
      clientIp: ctx?.clientIp,
      host: ctx?.host || request.headers.get('host') || undefined,
      scheme: ctx?.scheme || (request.url.startsWith('https:') ? 'https' : 'http'),
      requestId: ctx?.requestId || request.headers.get('x-request-id') || undefined,
      trustForwardedHost: ctx?.trustForwardedHost,
    };

    const headers = sanitizeRequestHeaders(request.headers, context);

    // D1 Proxy Loop Guard: set x-trackit-hop (after sanitization)
    if (ctx?.nextHop !== undefined && ctx.nextHop !== null) {
      headers['x-trackit-hop'] = String(ctx.nextHop);
    }

    let data: any = undefined;
    let maxRedirects: number;

    if (payload?.kind === 'stream') {
      data = payload.stream;
      // Disable redirect following so chunks are never re-buffered in memory
      // (CRITICAL-04 requirement; keeps SSRF via redirect moot for streamed bodies)
      maxRedirects = 0;
    } else if (payload?.kind === 'buffer') {
      data = payload.data;
      // Cap redirects for buffered payloads; guarded agents check each hop.
      maxRedirects = 3;
    } else {
      // No body (GET/HEAD/etc.)
      maxRedirects = 3;
    }

    const effectiveTimeout = Math.min(timeoutMs, getBackendConnectTimeoutMs());

    // Call the backend
    const response = await axios({
      method: request.method,
      url: targetUrl,
      headers,
      data,
      timeout: effectiveTimeout,
      validateStatus: () => true, // Do not throw on HTTP status errors, forward them
      responseType: 'arraybuffer',
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      signal: request.signal,
      maxRedirects,
      decompress: false,
      // ── B7: proxy:false prevents HTTP_PROXY/HTTPS_PROXY env routing around the guard ──
      proxy: false,
      // ── B7: use guarded agents so DNS is checked at connect time for each hop ──
      httpAgent,
      httpsAgent,
      // ── B7: check literal IPs before following redirects ──
      beforeRedirect: (options: any) => {
        const dest =
          options.href ||
          `${options.protocol || 'http:'}//${options.hostname}${options.path || '/'}`;
        try {
          assertLiteralIpAllowed(dest, server.id);
        } catch (err) {
          if (err instanceof SsrfBlockedError) {
            throw Object.assign(
              new Error('Bad Gateway: upstream request blocked'),
              { code: 'SSRF_BLOCKED', isSsrfBlocked: true }
            );
          }
          throw err;
        }
      },
    });

    // Construct response headers (B4: Upstream -> Client sanitization)
    const sanitizedResponse = sanitizeResponseHeaders(response.headers);
    const responseHeaders = new Headers();
    Object.entries(sanitizedResponse).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => responseHeaders.append(key, v));
      } else {
        responseHeaders.set(key, String(value));
      }
    });

    return new Response(response.data, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  }
}
