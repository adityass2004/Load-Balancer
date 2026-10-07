import http from "k6/http";
import { check } from "k6";
import { Counter } from "k6/metrics";

/*
============================================================
 TRACK-IT LOAD BALANCER - PERFORMANCE BENCHMARK
============================================================

Target:
    /api/health

Load profile:
    10 RPS
    100 RPS
    250 RPS
    500 RPS
    1000 RPS
    2000 RPS
    5000 RPS

Spike:
    100 -> 2000 -> 100 RPS

Endurance:
    2000 RPS x 500 seconds
    = 1,000,000 requests

IMPORTANT:
    This test measures the deployed Load Balancer endpoint.
============================================================
*/


// ============================================================
// CONFIG
// ============================================================

const BASE_URL =
    "https://trackit-load-balancer-277128202535.asia-south1.run.app";

const ENDPOINT = "/api/health";

const URL = `${BASE_URL}${ENDPOINT}`;


// ============================================================
// CUSTOM METRICS
// ============================================================

const errors = new Counter("benchmark_errors");
const successfulRequests = new Counter("benchmark_success");


// ============================================================
// LOAD TEST CONFIGURATION
// ============================================================

export const options = {

    scenarios: {

        load_test: {

            /*
            IMPORTANT:

            Arrival-rate executor means k6 attempts to
            start a fixed number of iterations per second.

            We increased preAllocatedVUs from 100 -> 1000
            because your previous test produced dropped
            iterations while handling high latency/load.
            */

            executor: "ramping-arrival-rate",

            startRate: 10,

            timeUnit: "1s",

            /*
            Number of VUs created before the test begins.

            100 was too conservative for high RPS testing.
            */

            preAllocatedVUs: 1000,

            /*
            Absolute maximum number of VUs k6 may use.
            */

            maxVUs: 5000,


            // --------------------------------------------------
            // LOAD STAGES
            // --------------------------------------------------

            stages: [

                // ==============================================
                // BASELINE
                // ==============================================

                {
                    target: 10,
                    duration: "30s",
                },

                {
                    target: 0,
                    duration: "5s",
                },


                // ==============================================
                // 100 RPS
                // ==============================================

                {
                    target: 100,
                    duration: "30s",
                },

                {
                    target: 0,
                    duration: "5s",
                },


                // ==============================================
                // 250 RPS
                // ==============================================

                {
                    target: 250,
                    duration: "30s",
                },

                {
                    target: 0,
                    duration: "5s",
                },


                // ==============================================
                // 500 RPS
                // ==============================================

                {
                    target: 500,
                    duration: "30s",
                },

                {
                    target: 0,
                    duration: "5s",
                },


                // ==============================================
                // 1000 RPS
                // ==============================================

                {
                    target: 1000,
                    duration: "30s",
                },

                {
                    target: 0,
                    duration: "5s",
                },


                // ==============================================
                // 2000 RPS
                // ==============================================

                {
                    target: 2000,
                    duration: "30s",
                },

                {
                    target: 0,
                    duration: "5s",
                },


                // ==============================================
                // 5000 RPS
                // ==============================================

                {
                    target: 5000,
                    duration: "30s",
                },

                {
                    target: 0,
                    duration: "10s",
                },


                // ==============================================
                // SPIKE TEST
                // ==============================================

                // Start at 100 RPS
                {
                    target: 100,
                    duration: "20s",
                },

                // Quickly increase to 2000 RPS
                {
                    target: 2000,
                    duration: "10s",
                },

                // Hold 2000 RPS
                {
                    target: 2000,
                    duration: "30s",
                },

                // Drop back to 100 RPS
                {
                    target: 100,
                    duration: "30s",
                },

                // Stop
                {
                    target: 0,
                    duration: "10s",
                },


                // ==============================================
                // ONE MILLION REQUEST ENDURANCE TEST
                // ==============================================

                /*
                    2000 RPS x 500 seconds
                    =
                    1,000,000 requests
                */

                {
                    target: 2000,
                    duration: "500s",
                },

                {
                    target: 0,
                    duration: "10s",
                },
            ],
        },
    },


    // ========================================================
    // PASS / FAIL CRITERIA
    // ========================================================

    thresholds: {

        /*
        Less than 1% HTTP request failures.
        */

        http_req_failed: [
            "rate<0.01",
        ],


        /*
        95% of requests should finish under 5 seconds.
        */

        http_req_duration: [
            "p(95)<5000",
        ],


        /*
        IMPORTANT:

        If k6 cannot start scheduled iterations,
        the benchmark should fail.

        This is intentionally NOT hidden.
        */

        dropped_iterations: [
            "count==0",
        ],
    },
};


// ============================================================
// SETUP
// ============================================================

export function setup() {

    console.log("");
    console.log("============================================================");
    console.log(" TRACK-IT LOAD BALANCER PERFORMANCE TEST");
    console.log("============================================================");

    console.log("");
    console.log(`Target: ${URL}`);

    console.log("");
    console.log("Load generator configuration:");
    console.log("Executor: ramping-arrival-rate");
    console.log("Preallocated VUs: 1000");
    console.log("Maximum VUs: 5000");

    console.log("");
    console.log("TEST PLAN:");
    console.log("");

    console.log("10 RPS      × 30 seconds");
    console.log("100 RPS     × 30 seconds");
    console.log("250 RPS     × 30 seconds");
    console.log("500 RPS     × 30 seconds");
    console.log("1000 RPS    × 30 seconds");
    console.log("2000 RPS    × 30 seconds");
    console.log("5000 RPS    × 30 seconds");

    console.log("");
    console.log("SPIKE:");
    console.log("100 → 2000 → 100 RPS");

    console.log("");
    console.log("ENDURANCE:");
    console.log("2000 RPS × 500 seconds");
    console.log("= 1,000,000 requests");

    console.log("");
    console.log("============================================================");
    console.log(" HEALTH CHECK");
    console.log("============================================================");

    const response = http.get(URL, {
        timeout: "30s",
    });

    const healthy = check(response, {
        "LB health endpoint returns 200":
            (r) => r.status === 200,
    });

    if (!healthy) {

        throw new Error(
            `Load balancer health check failed. HTTP status: ${response.status}`
        );
    }

    console.log("Health check: PASSED");
    console.log("");

    return {
        startedAt: new Date().toISOString(),
    };
}


// ============================================================
// REQUEST FUNCTION
// ============================================================

export default function () {

    const response = http.get(URL, {
        timeout: "30s",
    });


    // --------------------------------------------------------
    // Validate HTTP response
    // --------------------------------------------------------

    const success = check(response, {

        "HTTP 200":
            (r) => r.status === 200,

    });


    // --------------------------------------------------------
    // Custom metrics
    // --------------------------------------------------------

    if (success) {

        successfulRequests.add(1);

    } else {

        errors.add(1);

    }
}


// ============================================================
// FINAL REPORT
// ============================================================

export function handleSummary(data) {

    const metrics = data.metrics;


    // ========================================================
    // HTTP REQUEST METRICS
    // ========================================================

    const requests =
        metrics.http_reqs?.values || {};


    const duration =
        metrics.http_req_duration?.values || {};


    const failed =
        metrics.http_req_failed?.values || {};


    const dropped =
        metrics.dropped_iterations?.values || {};


    const iterations =
        metrics.iterations?.values || {};


    // ========================================================
    // TRAFFIC
    // ========================================================

    const requestCount =
        requests.count || 0;


    const actualRPS =
        requests.rate || 0;


    const iterationCount =
        iterations.count || 0;


    const droppedIterations =
        dropped.count || 0;


    // ========================================================
    // ERROR RATE
    // ========================================================

    const errorRate =
        (failed.rate || 0) * 100;


    // ========================================================
    // LATENCY
    // ========================================================

    const average =
        duration.avg || 0;


    const p50 =
        duration.med || 0;


    const p90 =
        duration["p(90)"] || 0;


    const p95 =
        duration["p(95)"] || 0;


    const p99 =
        duration["p(99)"] || 0;


    const maximum =
        duration.max || 0;


    // ========================================================
    // PASS / FAIL
    // ========================================================

    let status = "PASS";


    if (errorRate >= 1) {

        status = "FAIL";
    }


    if (p95 >= 5000) {

        status = "FAIL";
    }


    if (droppedIterations > 0) {

        status = "FAIL";
    }


    // ========================================================
    // REPORT OBJECT
    // ========================================================

    const report = {

        benchmark: {

            target: URL,

            generatedAt:
                new Date().toISOString(),
        },


        result: status,


        traffic: {

            totalRequests:
                requestCount,

            actualRPS:
                Number(actualRPS.toFixed(2)),

            iterations:
                iterationCount,

            droppedIterations:
                droppedIterations,
        },


        errors: {

            errorRatePercent:
                Number(errorRate.toFixed(4)),
        },


        latency: {

            averageMs:
                Number(average.toFixed(2)),

            p50Ms:
                Number(p50.toFixed(2)),

            p90Ms:
                Number(p90.toFixed(2)),

            p95Ms:
                Number(p95.toFixed(2)),

            p99Ms:
                Number(p99.toFixed(2)),

            maxMs:
                Number(maximum.toFixed(2)),
        },


        passCriteria: {

            errorRate:
                "< 1%",

            p95:
                "< 5000 ms",

            droppedIterations:
                "0",
        },
    };


    // ========================================================
    // MARKDOWN REPORT
    // ========================================================

    const markdown = `

# Track-It Load Balancer Benchmark

## Deployment

**Google Cloud Run**

### Endpoint

\`${URL}\`

### Load Testing Tool

**Grafana k6**

---

# Final Result

**${status}**

| Metric | Result |
|---|---:|
| Total Requests | ${requestCount} |
| Actual RPS | ${actualRPS.toFixed(2)} |
| Iterations | ${iterationCount} |
| Dropped Iterations | ${droppedIterations} |
| Error Rate | ${errorRate.toFixed(4)}% |
| Average Latency | ${average.toFixed(2)} ms |
| p50 | ${p50.toFixed(2)} ms |
| p90 | ${p90.toFixed(2)} ms |
| p95 | ${p95.toFixed(2)} ms |
| p99 | ${p99.toFixed(2)} ms |
| Maximum | ${maximum.toFixed(2)} ms |

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

\`${URL}\`

Therefore it primarily measures the deployed Load Balancer service.

It should not be interpreted as a complete benchmark of PostgreSQL,
Redis, Track-It, or other downstream services.

---

Generated automatically by Grafana k6.

`;


    // ========================================================
    // SAVE REPORTS
    // ========================================================

    return {

        "benchmark-summary.json":
            JSON.stringify(report, null, 2),

        "BENCHMARK.md":
            markdown,

    };
}