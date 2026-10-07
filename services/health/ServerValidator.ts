import axios from 'axios';
import { settingsRepository } from '@/repositories/settings.repository';
import { Algorithm } from '@/types/domain';
import { buildHealthUrl } from '@/lib/utils';
import { getSafeAgents, assertLiteralIpAllowed, SsrfBlockedError } from '@/lib/security/ssrf-guard';

export interface ValidationResult {
  isHealthy: boolean;
  responseTime: number;
  statusCode: number | null;
  errorMessage?: string;
}

export class ServerValidator {
  async validateServer(url: string): Promise<ValidationResult> {
    const startTime = Date.now();
    try {
      const settings = await settingsRepository.getOrCreate({
        algorithm: Algorithm.ROUND_ROBIN,
        healthCheckInterval: 30,
        healthCheckTimeout: 5,
        maxFailures: 3,
        autoRecovery: true,
        requestTimeout: 10000,
        maxRetries: 3,
      });

      const timeoutMs = settings.healthCheckTimeout * 1000;
      const healthUrl = buildHealthUrl(url);

      // ── B7: Literal-IP pre-check before making the request ──────────────────
      try {
        assertLiteralIpAllowed(healthUrl);
      } catch (err) {
        if (err instanceof SsrfBlockedError) {
          const responseTime = Date.now() - startTime;
          return {
            isHealthy: false,
            responseTime,
            statusCode: null,
            errorMessage: 'URL targets a disallowed network address',
          };
        }
        throw err;
      }

      // ── B7: Use guarded agents ───────────────────────────────────────────────
      const { httpAgent, httpsAgent } = getSafeAgents();

      const response = await axios.get(healthUrl, {
        timeout: timeoutMs,
        validateStatus: () => true,
        // B7: guard agents + proxy:false
        httpAgent,
        httpsAgent,
        proxy: false,
      });

      const responseTime = Date.now() - startTime;
      const isHealthy = response.status >= 200 && response.status < 500;

      if (isHealthy) {
        return {
          isHealthy: true,
          responseTime,
          statusCode: response.status,
        };
      } else {
        return {
          isHealthy: false,
          responseTime,
          statusCode: response.status,
          errorMessage: `Health endpoint returned status ${response.status}`,
        };
      }

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      let errorMessage = 'Failed to validate server';

      // SsrfBlockedError thrown by guarded lookup at connect time
      if (error instanceof SsrfBlockedError || error?.code === 'SSRF_BLOCKED') {
        return {
          isHealthy: false,
          responseTime,
          statusCode: null,
          errorMessage: 'URL targets a disallowed network address',
        };
      }

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') errorMessage = 'Connection refused by target host';
        else if (error.code === 'ENOTFOUND') errorMessage = 'DNS lookup failed: host not found';
        else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') errorMessage = 'Connection timed out';
        else if (error.message) errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        isHealthy: false,
        responseTime,
        statusCode: null,
        errorMessage,
      };
    }
  }
}

export const serverValidator = new ServerValidator();
