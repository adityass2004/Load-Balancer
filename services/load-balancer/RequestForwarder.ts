import axios from 'axios';
import { Server } from '@/types/domain';

export class RequestForwarder {
  async forward(server: Server, request: Request, timeoutMs: number): Promise<Response> {
    const incomingUrl = new URL(request.url);
    const backendUrl = new URL(server.url);

    // Build target URL respecting subpaths
    const backendPath = backendUrl.pathname.replace(/\/$/, '');
    const incomingPath = incomingUrl.pathname;
    const targetPath = `${backendPath}${incomingPath}`;
    const targetUrl = `${backendUrl.protocol}//${backendUrl.host}${targetPath}${incomingUrl.search}`;

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
