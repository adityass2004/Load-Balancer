import crypto from 'crypto';
import { LoadBalancingStrategy } from '@/interfaces/LoadBalancingStrategy';
import { Server } from '@/types/domain';
import { rateLimitKeyForIp } from '@/lib/client-ip';
import { RoundRobinStrategy } from '@/strategies/RoundRobinStrategy';

/**
 * IPHashStrategy (HIGH-05)
 *
 * Implements Rendezvous (Highest Random Weight / HRW) hashing over eligible servers.
 * - Key: rateLimitKeyForIp(clientIp) (canonicalizes IPv4, IPv4-mapped, and /64 IPv6 subnets)
 * - Hash: First 8 bytes of SHA-256 as unsigned 64-bit integer
 * - Score: Weighted rendezvous score = -weight / ln(u), with u in (0, 1]
 * - Tie-breaker: Lexicographical server id comparison
 * - Fallback: When client IP is unknown or missing, falls back to Round Robin with throttled warn
 * - Deterministic failover: When RetryService excludes previously failed servers, selecting
 *   over the remaining servers naturally yields the next-highest-scoring eligible server.
 */
export class IPHashStrategy implements LoadBalancingStrategy {
  private readonly roundRobin: RoundRobinStrategy;
  private static lastUnknownWarnTime: number = 0;

  constructor(roundRobinFallback?: RoundRobinStrategy) {
    this.roundRobin = roundRobinFallback ?? new RoundRobinStrategy();
  }

  selectServer(servers: Server[], clientIp?: string): Server | null {
    if (!servers || servers.length === 0) return null;

    if (!clientIp || clientIp.trim() === '' || clientIp === 'unknown') {
      this.logThrottledUnknownWarn();
      return this.roundRobin.selectServer(servers);
    }

    const key = rateLimitKeyForIp(clientIp);
    if (key === 'unknown') {
      this.logThrottledUnknownWarn();
      return this.roundRobin.selectServer(servers);
    }

    let bestServer: Server | null = null;
    let maxScore = -Infinity;

    for (const server of servers) {
      const score = this.calculateServerScore(key, server);
      if (score > maxScore) {
        maxScore = score;
        bestServer = server;
      } else if (score === maxScore && bestServer) {
        if (server.id.localeCompare(bestServer.id) < 0) {
          bestServer = server;
        }
      }
    }

    return bestServer;
  }

  private calculateServerScore(key: string, server: Server): number {
    const hash = crypto.createHash('sha256').update(`${key}:${server.id}`).digest();
    const hBigInt = hash.readBigUInt64BE(0);
    // Map top 53 bits into (0, 1]
    const u = (Number(hBigInt >> BigInt(11)) + 1) / 9007199254740993;
    const weight = Math.max(1, server.weight ?? 1);
    return -weight / Math.log(u);
  }

  private logThrottledUnknownWarn(): void {
    const now = Date.now();
    if (now - IPHashStrategy.lastUnknownWarnTime >= 60_000) {
      IPHashStrategy.lastUnknownWarnTime = now;
      console.warn('IP_HASH: client IP unknown, using round robin; check TRUSTED_PROXY_HOPS');
    }
  }

  static _resetThrottleForTesting(): void {
    IPHashStrategy.lastUnknownWarnTime = 0;
  }
}
