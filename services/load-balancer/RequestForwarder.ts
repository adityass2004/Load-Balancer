import axios from 'axios';
import { Server } from '@/types/domain';

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
    backendPath: string
  ): Promise<Response> {
    const targetUrl = buildUpstreamUrl(server.url, backendPath);

    // Copy all headers except host to avoid proxy target host header issues
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'host') {
        headers[key] = value;
      }
    });

    // Read the body as ArrayBuffer to support all content-types transparently
    let requestBody: Buffer | undefined = undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const arrayBuffer = await request.arrayBuffer();
        if (arrayBuffer.byteLength > 0) {
          requestBody = Buffer.from(arrayBuffer);
        }
      } catch {
        // Request has no readable body
      }
    }

    // Call the backend
    const response = await axios({
      method: request.method,
      url: targetUrl,
      headers,
      data: requestBody,
      timeout: timeoutMs,
      validateStatus: () => true, // Do not throw on HTTP status errors, forward them
      responseType: 'arraybuffer',
    });

    // Construct response headers
    const responseHeaders = new Headers();
    Object.entries(response.headers).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v) => responseHeaders.append(key, v));
        } else {
          responseHeaders.set(key, String(value));
        }
      }
    });

    return new Response(response.data, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  }
}
