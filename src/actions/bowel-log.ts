"use server";

import { createClient } from "@/lib/supabase/server";
import { bowelLogSchema } from "@/lib/validations/bowel-log";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types/database";

export async function createBowelLog(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "인증이 필요합니다" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = bowelLogSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase.from("bowel_logs").insert({
    user_id: user.id,
    ...parsed.data,
  });

  if (error) return { error: error.message };
  revalidatePath("/tracking");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteBowelLog(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "인증이 필요합니다" };

  const { error } = await supabase
    .from("bowel_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/tracking");
  revalidatePath("/dashboard");
  return { success: true };
}
