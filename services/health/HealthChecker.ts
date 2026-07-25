import axios, { AxiosError } from 'axios';
import type { IHealthChecker, HealthCheckResult, HealthCheckOutcome } from '@/types/health';
import type { Server } from '@/types/domain';
import { buildHealthUrl } from '@/lib/utils';

class HealthChecker implements IHealthChecker {
  async check(
    server: Pick<Server, 'id' | 'name' | 'url'>,
    timeoutMs: number
  ): Promise<HealthCheckResult> {
    const checkedAt = new Date();
    const targetUrl = buildHealthUrl(server.url);
    const startTime = Date.now();

    try {
      const response = await axios.get(targetUrl, {
        timeout: timeoutMs,
        validateStatus: () => true, // handle all status codes manually
        headers: { 'User-Agent': 'TrackIt-HealthChecker/1.0' },
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
