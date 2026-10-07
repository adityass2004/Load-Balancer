import { describe, it, expect } from 'vitest';

function parseHopCount(rawHop: string | null | undefined): number {
  if (!rawHop) return 0;
  const parsed = parseInt(rawHop.trim(), 10);
  if (isNaN(parsed) || parsed < 0) return 0;
  return Math.min(100, parsed);
}

function evaluateLoopGuard(
  rawHop: string | null | undefined,
  maxHops = 3
): { loopDetected: boolean; nextHop: number; status?: number } {
  const hopCount = parseHopCount(rawHop);
  if (hopCount >= maxHops) {
    return { loopDetected: true, nextHop: hopCount, status: 508 };
  }
  return { loopDetected: false, nextHop: hopCount + 1 };
}

describe('Proxy Loop Guard - Part D', () => {
  it('forwards hops 0, 1, 2 with +1 increment when maxHops is 3', () => {
    // No header / hop 0
    const res0 = evaluateLoopGuard(null, 3);
    expect(res0.loopDetected).toBe(false);
    expect(res0.nextHop).toBe(1);

    // Hop 1
    const res1 = evaluateLoopGuard('1', 3);
    expect(res1.loopDetected).toBe(false);
    expect(res1.nextHop).toBe(2);

    // Hop 2
    const res2 = evaluateLoopGuard('2', 3);
    expect(res2.loopDetected).toBe(false);
    expect(res2.nextHop).toBe(3);
  });

  it('detects loop and returns 508 when hop count >= maxHops (hop 3)', () => {
    const res3 = evaluateLoopGuard('3', 3);
    expect(res3.loopDetected).toBe(true);
    expect(res3.status).toBe(508);

    const res4 = evaluateLoopGuard('4', 3);
    expect(res4.loopDetected).toBe(true);
    expect(res4.status).toBe(508);
  });

  it('treats negative and garbage values as hop 0', () => {
    const resNeg = evaluateLoopGuard('-5', 3);
    expect(resNeg.loopDetected).toBe(false);
    expect(resNeg.nextHop).toBe(1);

    const resGarbage = evaluateLoopGuard('invalid-hop-str', 3);
    expect(resGarbage.loopDetected).toBe(false);
    expect(resGarbage.nextHop).toBe(1);

    const resEmpty = evaluateLoopGuard('', 3);
    expect(resEmpty.loopDetected).toBe(false);
    expect(resEmpty.nextHop).toBe(1);
  });

  it('clamps huge values to 100 and rejects when >= maxHops', () => {
    const resHuge = evaluateLoopGuard('999999', 3);
    expect(resHuge.loopDetected).toBe(true);
    expect(resHuge.status).toBe(508);
  });
});
