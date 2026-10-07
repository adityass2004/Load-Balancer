import { z } from 'zod';

const positiveIntSchema = (defaultVal: number, maxVal?: number) => {
  return z
    .string()
    .optional()
    .transform((val) => (val === undefined || val === '' ? defaultVal : Number(val)))
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: 'Must be a positive integer',
    })
    .refine((val) => maxVal === undefined || val <= maxVal, {
      message: `Must not exceed ${maxVal}`,
    });
};

export const BodyConfigSchema = z
  .object({
    maxBytes: positiveIntSchema(10_485_760, 1_073_741_824), // default 10MB, max 1GB
    thresholdBytes: positiveIntSchema(262_144),              // default 256KB
    budgetBytes: positiveIntSchema(33_554_432),              // default 32MB
  })
  .refine((cfg) => cfg.thresholdBytes <= cfg.maxBytes, {
    message: 'BODY_BUFFER_THRESHOLD_BYTES cannot exceed MAX_REQUEST_BODY_BYTES',
  });

export type BodyConfig = z.infer<typeof BodyConfigSchema>;

export function parseBodyConfig(): BodyConfig {
  const result = BodyConfigSchema.safeParse({
    maxBytes: process.env.MAX_REQUEST_BODY_BYTES,
    thresholdBytes: process.env.BODY_BUFFER_THRESHOLD_BYTES,
    budgetBytes: process.env.BODY_BUFFER_BUDGET_BYTES,
  });

  if (!result.success) {
    const errorDetails = result.error.issues
      .map((e) => `${e.path.join('.') || 'config'}: ${e.message}`)
      .join(', ');
    throw new Error(`[FATAL] Invalid request body configuration: ${errorDetails}`);
  }

  return result.data;
}

export const bodyConfig = parseBodyConfig();
