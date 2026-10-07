

# Track-It Load Balancer Benchmark

## Deployment

**Google Cloud Run**

### Endpoint

`https://trackit-load-balancer-277128202535.asia-south1.run.app/api/health`

### Load Testing Tool

**Grafana k6**

---

# Final Result

**FAIL**

| Metric | Result |
|---|---:|
| Total Requests | 775034 |
| Actual RPS | 900.68 |
| Iterations | 775033 |
| Dropped Iterations | 6166 |
| Error Rate | 0.0000% |
| Average Latency | 129.15 ms |
| p50 | 49.41 ms |
| p90 | 281.15 ms |
| p95 | 346.81 ms |
| p99 | 0.00 ms |
| Maximum | 7647.91 ms |

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

# Endurance Test

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

# Load Generator

- Executor: ramping-arrival-rate
- Preallocated VUs: 1000
- Maximum VUs: 5000

---

# Important

This benchmark targets:

`https://trackit-load-balancer-277128202535.asia-south1.run.app/api/health`

Therefore it primarily measures the deployed Load Balancer service.

It should not be interpreted as a complete benchmark of PostgreSQL,
Redis, Track-It, or other downstream services.

---

Generated automatically by Grafana k6.

