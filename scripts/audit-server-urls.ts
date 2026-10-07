import 'dotenv/config';
// @ts-ignore
import { PrismaClient } from '../src/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { validateBackendUrl } from '../lib/security/ssrf-guard';

/**
 * scripts/audit-server-urls.ts
 *
 * Read-only ops tool: loads all non-deleted servers from the DB, runs
 * validateBackendUrl on each URL, and prints a PASS/FAIL table.
 *
 * Rules:
 *  - Does NOT modify or delete any data.
 *  - Does NOT print credentials: if the URL contains a userinfo component
 *    (user:pass@) the URL is redacted to "<REDACTED URL>".
 *  - Exits with code 1 if any URL fails validation.
 *
 * Usage:
 *   npm run audit:server-urls
 *   # or with loopback allowed for dev:
 *   BACKEND_ALLOW_LOOPBACK=true npm run audit:server-urls
 */

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function redactUrl(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    if (u.username || u.password) {
      return '<REDACTED URL (contains credentials)>';
    }
    return rawUrl;
  } catch {
    return '<UNPARSEABLE URL>';
  }
}

async function main() {
  console.log('\n[audit:server-urls] Loading all servers from database...\n');

  const servers = await prisma.server.findMany({
    where: { deletedAt: null },
    include: { project: { select: { slug: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  });

  if (servers.length === 0) {
    console.log('[audit:server-urls] No servers found.\n');
    return;
  }

  const results: Array<{
    id: string;
    project: string;
    displayUrl: string;
    status: 'PASS' | 'FAIL';
    reason?: string;
  }> = [];

  for (const server of servers) {
    const displayUrl = redactUrl(server.url);
    const result = await validateBackendUrl(server.url);

    results.push({
      id: server.id.slice(0, 8),
      project: server.project?.slug ?? '(no project)',
      displayUrl,
      status: result.ok ? 'PASS' : 'FAIL',
      reason: result.ok ? undefined : result.reason,
    });
  }

  // Print table
  const colWidths = {
    id: 10,
    project: Math.max(10, ...results.map((r) => r.project.length)) + 2,
    url: Math.min(60, Math.max(10, ...results.map((r) => r.displayUrl.length))) + 2,
    status: 6,
    reason: 40,
  };

  const header = [
    'ID'.padEnd(colWidths.id),
    'Project'.padEnd(colWidths.project),
    'URL'.padEnd(colWidths.url),
    'Status'.padEnd(colWidths.status),
    'Reason',
  ].join(' | ');

  const divider = '-'.repeat(header.length);

  console.log(divider);
  console.log(header);
  console.log(divider);

  let failCount = 0;
  for (const r of results) {
    if (r.status === 'FAIL') failCount++;
    const displayUrlTruncated =
      r.displayUrl.length > colWidths.url - 2
        ? r.displayUrl.slice(0, colWidths.url - 5) + '...'
        : r.displayUrl;
    console.log(
      [
        r.id.padEnd(colWidths.id),
        r.project.padEnd(colWidths.project),
        displayUrlTruncated.padEnd(colWidths.url),
        r.status.padEnd(colWidths.status),
        r.reason ?? '',
      ].join(' | ')
    );
  }

  console.log(divider);
  console.log(
    `\n[audit:server-urls] ${results.length} servers checked. PASS: ${results.length - failCount}, FAIL: ${failCount}\n`
  );

  if (failCount > 0) {
    console.error(
      '[audit:server-urls] WARNING: Some stored backend URLs would be blocked at connect time by the SSRF guard.'
    );
    console.error('[audit:server-urls] These servers will return 502 on proxy/health requests.');
    console.error('[audit:server-urls] Update or remove them to restore normal operation.\n');
    process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error('[audit:server-urls] ERROR:', err.message || err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
