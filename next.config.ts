import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  // No rewrites needed.
  // Placing the catch-all at app/api/[...path]/route.ts means Next.js routes
  // /api/* directly to the load balancer handler. Static routes like
  // app/api/health/route.ts take priority automatically via Next.js specificity.
};

export default nextConfig;
