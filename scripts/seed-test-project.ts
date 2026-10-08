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
  const backendConfigs = [
    { port: 4001, name: 'Backend 1 (Port 4001)' },
    { port: 4002, name: 'Backend 2 (Port 4002)' },
    { port: 4003, name: 'Backend 3 (Port 4003)' },
  ];

  // Delete all existing servers for this project to eliminate any duplicate entries
  await prisma.server.deleteMany({
    where: { projectId: project.id }
  });

  for (const b of backendConfigs) {
    const targetUrl = `http://${lanHost}:${b.port}`;
    await prisma.server.create({
      data: {
        projectId: project.id,
        name: b.name,
        url: targetUrl,
        weight: 1,
        priority: 1,
        enabled: true,
        healthy: 'HEALTHY',
      },
    });
    console.log(`[SEED] Created server ${targetUrl}`);
  }

  const finalCount = await prisma.server.count({
    where: { projectId: project.id }
  });

  console.log(`[SEED] Successfully seeded test-project! Total active servers: ${finalCount}`);
}

main()
  .catch((err) => {
    console.error('[SEED ERROR]', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
