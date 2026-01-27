import { z } from "zod";

const optionalNumber = (max: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : null))
    .pipe(z.number().min(0).max(max).nullable());

export const inbodyLogSchema = z.object({
  measured_date: z.string().min(1, "측정일을 입력하세요"),
  basal_metabolic_rate: optionalNumber(5000),
  skeletal_muscle_mass: optionalNumber(100),
  body_fat_mass: optionalNumber(200),
  bmi: optionalNumber(100),
  body_fat_pct: optionalNumber(100),
  abdominal_fat_ratio: optionalNumber(10),
  visceral_fat_level: optionalNumber(30),
  body_water: optionalNumber(100),
  protein: optionalNumber(50),
  minerals: optionalNumber(20),
});

export type InbodyLogInput = z.input<typeof inbodyLogSchema>;
