import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { DailyLogForm } from "@/components/forms/daily-log-form";
import { DeleteButton } from "@/components/forms/delete-button";
import { deleteDailyLog } from "@/actions/daily-log";
import { notFound } from "next/navigation";
import type { DailyLog } from "@/lib/types/database";

export default async function DailyLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: log } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("id", id)
    .single();

  if (!log) notFound();

  return (
    <>
      <Header title="기록 수정" />
      <PageContainer>
        <div className="space-y-4">
          <DailyLogForm initialData={log as DailyLog} />
          <DeleteButton id={id} action={deleteDailyLog} redirectTo="/daily" />
        </div>
      </PageContainer>
    </>
  );
}
