"use server";

import { createClient } from "@/lib/supabase/server";
import { inbodyLogSchema } from "@/lib/validations/inbody-log";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types/database";

export async function createInbodyLog(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "인증이 필요합니다" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = inbodyLogSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase.from("inbody_logs").insert({
    user_id: user.id,
    ...parsed.data,
  });

  if (error) return { error: error.message };
  revalidatePath("/inbody");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateInbodyLog(id: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "인증이 필요합니다" };

  const raw = Object.fromEntries(formData.entries());
  const parsed = inbodyLogSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("inbody_logs")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/inbody");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteInbodyLog(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "인증이 필요합니다" };

  const { error } = await supabase
    .from("inbody_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/inbody");
  revalidatePath("/dashboard");
  return { success: true };
}
