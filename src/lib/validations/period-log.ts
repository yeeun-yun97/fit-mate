import { z } from "zod";

export const periodLogSchema = z.object({
  start_date: z.string().min(1, "시작일을 입력하세요"),
  end_date: z
    .string()
    .optional()
    .transform((v) => v || null),
  note: z
    .string()
    .optional()
    .transform((v) => v || null),
});

export type PeriodLogInput = z.input<typeof periodLogSchema>;
