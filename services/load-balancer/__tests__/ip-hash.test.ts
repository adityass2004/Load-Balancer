import { describe, it, expect } from 'vitest';
import { IPHashStrategy } from '../strategies/IPHashStrategy';
import { Server, ServerHealth } from '@/types/domain';

function makeServer(id: string, weight = 1, healthy = ServerHealth.HEALTHY, enabled = true): Server {
  return {
    id,
    name: `Server ${id}`,
    url: `http://10.0.0.${id}:8080`,
    weight,
    priority: 0,
    enabled,
    healthy,
    failureCount: 0,
    requestsHandled: 0,
    activeRequests: 0,
    averageResponseTime: 0,
    lastHealthCheck: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
}

describe('IP_HASH Rendezvous Strategy - HIGH-05', () => {
  const servers = [makeServer('srv-1', 1), makeServer('srv-2', 1), makeServer('srv-3', 1)];

  it('same IP always maps to the same server over 1000 consecutive calls', () => {
    const strategy = new IPHashStrategy();
    const testIp = '198.51.100.42';
    const firstChoice = strategy.selectServer(servers, testIp);
    expect(firstChoice).not.toBeNull();

    for (let i = 0; i < 1000; i++) {
      const choice = strategy.selectServer(servers, testIp);
      expect(choice?.id).toBe(firstChoice?.id);
    }
  });

  it('fresh strategy instances agree on server selection for the same IP and server set', () => {
    const s1 = new IPHashStrategy();
    const s2 = new IPHashStrategy();

    for (let i = 1; i <= 100; i++) {
      const ip = `10.0.${Math.floor(i / 256)}.${i % 256}`;
      expect(s1.selectServer(servers, ip)?.id).toBe(s2.selectServer(servers, ip)?.id);
    }
  });

  it('uniform spread over 10,000 random IPv4s across 3 equal servers (within 25% of the mean)', () => {
    const strategy = new IPHashStrategy();
    const counts: Record<string, number> = { 'srv-1': 0, 'srv-2': 0, 'srv-3': 0 };
    const total = 10000;
    const mean = total / 3; // 3333.33

    for (let i = 0; i < total; i++) {
      const octet1 = (i * 17 + 11) % 250 + 1;
      const octet2 = (i * 31 + 7) % 250 + 1;
      const octet3 = (i * 47 + 13) % 250 + 1;
      const octet4 = (i * 59 + 3) % 250 + 1;
      const ip = `${octet1}.${octet2}.${octet3}.${octet4}`;

      const picked = strategy.selectServer(servers, ip);
      if (picked) counts[picked.id]++;
    }

    const minAllowed = mean * 0.75;
    const maxAllowed = mean * 1.25;

    for (const [srvId, count] of Object.entries(counts)) {
      const diffFromMean = Math.abs(count - mean) / mean;
      console.log(`[IP_HASH SPREAD] server=${srvId} count=${count} diffFromMean=${(diffFromMean * 100).toFixed(2)}%`);
      expect(count).toBeGreaterThanOrEqual(minAllowed);
      expect(count).toBeLessThanOrEqual(maxAllowed);
    }
  });

  it('removing one server only remaps keys that were on it (>= 95% of other keys unchanged)', () => {
    const strategy = new IPHashStrategy();
    const initialServers = [makeServer('srv-1'), makeServer('srv-2'), makeServer('srv-3')];
    const reducedServers = [makeServer('srv-1'), makeServer('srv-2')]; // srv-3 removed

    let unshiftedKeys = 0;
    let keysInitiallyOnRemaining = 0;

    for (let i = 1; i <= 2000; i++) {
      const ip = `172.16.${Math.floor(i / 256)}.${i % 256}`;
      const choice1 = strategy.selectServer(initialServers, ip);
      const choice2 = strategy.selectServer(reducedServers, ip);

      if (choice1?.id !== 'srv-3') {
        keysInitiallyOnRemaining++;
        if (choice1?.id === choice2?.id) {
          unshiftedKeys++;
        }
      }
    }

    const stabilityRatio = unshiftedKeys / keysInitiallyOnRemaining;
    expect(stabilityRatio).toBeGreaterThanOrEqual(0.95);
    // In rendezvous hashing, 100% of keys on srv-1 and srv-2 remain undisturbed!
    expect(stabilityRatio).toBe(1.0);
  });

  it('adding a server moves roughly 1/N of keys', () => {
    const strategy = new IPHashStrategy();
    const threeServers = [makeServer('srv-1'), makeServer('srv-2'), makeServer('srv-3')];
    const fourServers = [...threeServers, makeServer('srv-4')]; // 4 servers (1/4 = 25% expected on srv-4)

    let movedToNewServer = 0;
    const total = 4000;

    for (let i = 1; i <= total; i++) {
      const ip = `192.0.2.${i % 250}`;
      const choiceOld = strategy.selectServer(threeServers, ip);
      const choiceNew = strategy.selectServer(fourServers, ip);

      if (choiceNew?.id === 'srv-4') {
        movedToNewServer++;
      } else {
        // If not mapped to srv-4, it must remain on the exact same server
        expect(choiceNew?.id).toBe(choiceOld?.id);
      }
    }

    const ratio = movedToNewServer / total;
    // Expected ~0.25 (between 0.18 and 0.32)
    expect(ratio).toBeGreaterThan(0.18);
    expect(ratio).toBeLessThan(0.32);
  });

  it('failover returns the second-best server deterministically', () => {
    const strategy = new IPHashStrategy();
    const testIp = '198.51.100.99';

    // 1. Best server among 3
    const best = strategy.selectServer(servers, testIp);
    expect(best).not.toBeNull();

    // 2. Retry excluding the best server
    const remaining = servers.filter((s) => s.id !== best?.id);
    const secondBest1 = strategy.selectServer(remaining, testIp);
    const secondBest2 = strategy.selectServer(remaining, testIp);

    expect(secondBest1).not.toBeNull();
    expect(secondBest1?.id).not.toBe(best?.id);
    expect(secondBest1?.id).toBe(secondBest2?.id);
  });

  it('two IPv6 addresses in the same /64 subnet map to the same server', () => {
    const strategy = new IPHashStrategy();
    const ip1 = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
    const ip2 = '2001:db8:85a3::ffff:1234'; // Same /64 prefix (2001:0db8:85a3:0000)

    const choice1 = strategy.selectServer(servers, ip1);
    const choice2 = strategy.selectServer(servers, ip2);
    expect(choice1?.id).toBe(choice2?.id);
  });

  it('IPv4-mapped IPv6 address maps to the same server as its pure IPv4 address', () => {
    const strategy = new IPHashStrategy();
    const ipv4 = '198.51.100.77';
    const mapped = '::ffff:198.51.100.77';

    const choice1 = strategy.selectServer(servers, ipv4);
    const choice2 = strategy.selectServer(servers, mapped);
    expect(choice1?.id).toBe(choice2?.id);
  });

  it('unknown or missing IP falls back to round robin with throttled warn', () => {
    const strategy = new IPHashStrategy();
    IPHashStrategy._resetThrottleForTesting();

    const choice1 = strategy.selectServer(servers, 'unknown');
    const choice2 = strategy.selectServer(servers, 'unknown');
    const choice3 = strategy.selectServer(servers, undefined);

    expect(choice1).not.toBeNull();
    expect(choice2).not.toBeNull();
    expect(choice3).not.toBeNull();
  });

  it('returns null when server list is empty', () => {
    const strategy = new IPHashStrategy();
    expect(strategy.selectServer([], '1.2.3.4')).toBeNull();
  });
});
