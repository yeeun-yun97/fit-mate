export interface DailyFasting {
  id: string;
  user_id: string;
  log_date: string;
  fasting_glucose: number | null;
  fasting_ketone: number | null;
  created_at: string;
  updated_at: string;
}

export interface InbodyLog {
  id: string;
  user_id: string;
  measured_date: string;
  basal_metabolic_rate: number | null;
  skeletal_muscle_mass: number | null;
  body_fat_mass: number | null;
  bmi: number | null;
  body_fat_pct: number | null;
  abdominal_fat_ratio: number | null;
  visceral_fat_level: number | null;
  body_water: number | null;
  protein: number | null;
  minerals: number | null;
  created_at: string;
  updated_at: string;
}

export interface PeriodLog {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface BowelLog {
  id: string;
  user_id: string;
  log_date: string;
  log_time: string | null;
  note: string | null;
  created_at: string;
}

export type ActionResult = {
  error?: string;
  success?: boolean;
};
