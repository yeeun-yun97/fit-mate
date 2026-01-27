"use server";

import { createClient } from "@/lib/supabase/server";
import { periodLogSchema } from "@/lib/validations/period-log";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types/database";

export async function createPeriodLog(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "인증이 필요합니다" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = periodLogSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase.from("period_logs").insert({
    user_id: user.id,
    ...parsed.data,
  });

  if (error) return { error: error.message };
  revalidatePath("/tracking");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updatePeriodLog(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "인증이 필요합니다" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = periodLogSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("period_logs")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/tracking");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deletePeriodLog(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "인증이 필요합니다" };

  const { error } = await supabase
    .from("period_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/tracking");
  revalidatePath("/dashboard");
  return { success: true };
}
