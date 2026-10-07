import { prisma } from '../lib/db';

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to run seed script in production environment!');
  }

  const projectSlug = 'test-project';
  console.log(`[SEED] Upserting test project: ${projectSlug}`);

  // Upsert project
  const project = await prisma.project.upsert({
    where: { slug: projectSlug },
    update: {
      name: 'E2E Test Project',
      enabled: true,
    },
    create: {
      name: 'E2E Test Project',
      slug: projectSlug,
      enabled: true,
    },
  });

  console.log(`[SEED] Project ID: ${project.id}`);

  // Upsert settings
  await prisma.settings.upsert({
    where: { projectId: project.id },
    update: {
      algorithm: 'ROUND_ROBIN',
      requestTimeout: 5000,
      maxRetries: 3,
      healthCheckInterval: 10,
    },
    create: {
      projectId: project.id,
      algorithm: 'ROUND_ROBIN',
      requestTimeout: 5000,
      maxRetries: 3,
      healthCheckInterval: 10,
    },
  });

  const lanHost = process.env.TEST_BACKEND_HOST || '10.3.76.189';
  const backendUrls = [
    { url: `http://${lanHost}:4001`, name: 'Backend 1 (Port 4001)' },
    { url: `http://${lanHost}:4002`, name: 'Backend 2 (Port 4002)' },
    { url: `http://${lanHost}:4003`, name: 'Backend 3 (Port 4003)' },
  ];

  for (const b of backendUrls) {
    const existing = await prisma.server.findFirst({
      where: { projectId: project.id, url: b.url },
    });

    if (existing) {
      await prisma.server.update({
        where: { id: existing.id },
        data: { enabled: true, deletedAt: null, failureCount: 0, healthy: 'HEALTHY' },
      });
      console.log(`[SEED] Updated server ${b.url}`);
    } else {
      await prisma.server.create({
        data: {
          projectId: project.id,
          name: b.name,
          url: b.url,
          weight: 1,
          priority: 1,
          enabled: true,
          healthy: 'HEALTHY',
        },
      });
      console.log(`[SEED] Created server ${b.url}`);
    }
  }

  console.log('[SEED] Successfully seeded test-project with 3 backends!');
}

main()
  .catch((err) => {
    console.error('[SEED ERROR]', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
