/**
 * Next.js Instrumentation Hook
 *
 * Called once when the Node.js runtime starts (not in Edge).
 * Registers SIGTERM/SIGINT handlers to flush the log queue on shutdown.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getLogQueue } = await import('@/services/logging/LogQueue');

    let shutdownCalled = false;

    const gracefulShutdown = async (signal: string) => {
      if (shutdownCalled) return;
      shutdownCalled = true;

      console.info(`[INSTRUMENTATION] ${signal} received — flushing log queue...`);
      try {
        const queue = getLogQueue();
        const stats = queue.stats();
        if (stats.queueDepth > 0) {
          console.info(`[INSTRUMENTATION] Flushing ${stats.queueDepth} queued log entries...`);
          await queue.shutdown();
          const after = queue.stats();
          console.info(
            `[INSTRUMENTATION] Flush complete. Written: ${after.written - stats.written}, ` +
              `remaining: ${after.queueDepth}`
          );
        }
      } catch (err) {
        console.error(
          '[INSTRUMENTATION] Error during log queue shutdown:',
          err instanceof Error ? err.message : err
        );
      }
      // Do NOT call process.exit() — let Next.js handle that
    };

    process.on('SIGTERM', () => {
      gracefulShutdown('SIGTERM');
    });
    process.on('SIGINT', () => {
      gracefulShutdown('SIGINT');
    });
  }
}
