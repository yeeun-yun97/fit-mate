import { z } from "zod";

export const bowelLogSchema = z.object({
  log_date: z.string().min(1, "날짜를 입력하세요"),
  log_time: z
    .string()
    .optional()
    .transform((v) => v || null),
  note: z
    .string()
    .optional()
    .transform((v) => v || null),
});

export type BowelLogInput = z.input<typeof bowelLogSchema>;
