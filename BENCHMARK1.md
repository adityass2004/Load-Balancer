

# Track-It Load Balancer Benchmark

## Deployment

**Google Cloud Run**

### Endpoint

`https://trackit-load-balancer-277128202535.asia-south1.run.app/api/health`

### Tool

**Grafana k6**

---

# Final Result

**FAIL**

| Metric | Result |
|---|---:|
| Total Requests | 774011 |
| Actual RPS | 899.14 |
| Error Rate | 0.0000% |
| Dropped Iterations | 7189 |
| Average Latency | 147.87 ms |
| p50 | 48.27 ms |
| p90 | 283.86 ms |
| p95 | 548.83 ms |
| p99 | 0.00 ms |
| Maximum | 13654.76 ms |

---

# Load Profile

| Test | Target |
|---|---:|
| Baseline | 10 RPS |
| Load | 100 RPS |
| Load | 250 RPS |
| Load | 500 RPS |
| Load | 1,000 RPS |
| Load | 2,000 RPS |
| Load | 5,000 RPS |
| Spike | 100 → 2,000 → 100 RPS |
| Endurance | 1,000,000 requests |

---

# One Million Request Test

The endurance test targets:

**2,000 RPS × 500 seconds**

Therefore:

**1,000,000 requests**

---

# Pass Criteria

- Error rate < 1%
- p95 latency < 5 seconds
- Dropped iterations = 0

---

# Important

This benchmark targets the Load Balancer health endpoint:

`https://trackit-load-balancer-277128202535.asia-south1.run.app/api/health`

Therefore this primarily measures the deployed Load Balancer service.

It should not be interpreted as a complete benchmark of PostgreSQL,
Redis, Track-It, or other downstream services.

---

Generated automatically by Grafana k6.

