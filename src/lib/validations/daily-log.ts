import { z } from "zod";

export const dailyLogSchema = z.object({
  log_date: z.string().min(1, "날짜를 입력하세요"),
  fasting_glucose: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : null))
    .pipe(z.number().min(0).max(500).nullable()),
  fasting_ketone: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : null))
    .pipe(z.number().min(0).max(20).nullable()),
  diet_note: z
    .string()
    .optional()
    .transform((v) => v || null),
});

export type DailyLogInput = z.input<typeof dailyLogSchema>;
