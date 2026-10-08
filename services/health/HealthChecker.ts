import axios, { AxiosError } from 'axios';
import type { IHealthChecker, HealthCheckResult, HealthCheckOutcome } from '@/types/health';
import type { Server } from '@/types/domain';
import { buildHealthUrl } from '@/lib/utils';
import { getSafeAgents, assertLiteralIpAllowed, SsrfBlockedError, getBackendConnectTimeoutMs } from '@/lib/security/ssrf-guard';

class HealthChecker implements IHealthChecker {
  async check(
    server: Pick<Server, 'id' | 'name' | 'url'>,
    timeoutMs: number
  ): Promise<HealthCheckResult> {
    const checkedAt = new Date();
    const targetUrl = buildHealthUrl(server.url);
    const startTime = Date.now();

    // ── B7: Connect-time literal-IP pre-check ──────────────────────────────
    // Node does NOT call the guarded lookup for literal IPs; check explicitly.
    try {
      assertLiteralIpAllowed(targetUrl, server.id);
    } catch (err) {
      if (err instanceof SsrfBlockedError) {
        const latencyMs = Date.now() - startTime;
        console.warn(
          `[SSRF] Health check blocked: category=${err.category} serverId=${server.id.slice(0, 8)}`
        );
        return {
          serverId: server.id,
          serverName: server.name,
          url: targetUrl,
          success: false,
          outcome: 'connection_refused',
          statusCode: null,
          latencyMs,
          checkedAt,
          error: 'Bad Gateway: upstream request blocked',
        };
      }
      throw err;
    }

    // ── B7: Use guarded agents for connect-time DNS check ──────────────────
    const { httpAgent, httpsAgent } = getSafeAgents(server.id);

    try {
      const effectiveTimeout = Math.min(timeoutMs, getBackendConnectTimeoutMs());
      const response = await axios.get(targetUrl, {
        timeout: effectiveTimeout,
        validateStatus: () => true, // handle all status codes manually
        headers: { 'User-Agent': 'LoadBalancer-HealthChecker/1.0' },
        // B7: guard agents + proxy:false so HTTP_PROXY cannot bypass the guard
        httpAgent,
        httpsAgent,
        proxy: false,
      });

      const latencyMs = Date.now() - startTime;
      const isSuccess = response.status >= 200 && response.status < 500;

      return {
        serverId: server.id,
        serverName: server.name,
        url: targetUrl,
        success: isSuccess,
        outcome: isSuccess ? 'success' : 'http_error',
        statusCode: response.status,
        latencyMs,
        checkedAt,
        error: isSuccess ? null : `HTTP ${response.status}`,
      };
    } catch (e) {
      const latencyMs = Date.now() - startTime;

      // SsrfBlockedError thrown by guarded lookup at connect time
      if (e instanceof SsrfBlockedError) {
        console.warn(
          `[SSRF] Health check connect-time blocked: category=${e.category} serverId=${server.id.slice(0, 8)}`
        );
        return {
          serverId: server.id,
          serverName: server.name,
          url: targetUrl,
          success: false,
          outcome: 'connection_refused',
          statusCode: null,
          latencyMs,
          checkedAt,
          error: 'Bad Gateway: upstream request blocked',
        };
      }

      // Check if the axios error wraps an SsrfBlockedError (thrown via lookup callback)
      const anyErr = e as any;
      if (anyErr?.code === 'SSRF_BLOCKED' || anyErr?.cause instanceof SsrfBlockedError) {
        console.warn(
          `[SSRF] Health check lookup blocked: serverId=${server.id.slice(0, 8)}`
        );
        return {
          serverId: server.id,
          serverName: server.name,
          url: targetUrl,
          success: false,
          outcome: 'connection_refused',
          statusCode: null,
          latencyMs,
          checkedAt,
          error: 'Bad Gateway: upstream request blocked',
        };
      }

      const { outcome, message } = classifyError(e);

      return {
        serverId: server.id,
        serverName: server.name,
        url: targetUrl,
        success: false,
        outcome,
        statusCode: null,
        latencyMs,
        checkedAt,
        error: message,
      };
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function classifyError(error: unknown): { outcome: HealthCheckOutcome; message: string } {
  if (!axios.isAxiosError(error)) {
    return {
      outcome: 'unknown_error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  const err = error as AxiosError;

  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    return { outcome: 'timeout', message: 'Request timed out' };
  }

  if (err.code === 'ECONNREFUSED') {
    return { outcome: 'connection_refused', message: 'Connection refused' };
  }

  if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') {
    return { outcome: 'dns_failure', message: `DNS resolution failed: ${err.config?.url}` };
  }

  if (err.code === 'ERR_INVALID_URL') {
    return { outcome: 'invalid_url', message: `Invalid URL: ${err.config?.url}` };
  }

  if (err.response) {
    return {
      outcome: 'http_error',
      message: `HTTP ${err.response.status}: ${err.response.statusText}`,
    };
  }

  return { outcome: 'network_error', message: err.message ?? 'Network error' };
}

export const healthChecker = new HealthChecker();
