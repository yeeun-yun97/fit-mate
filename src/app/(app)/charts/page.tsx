import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { ChartsContent } from "@/components/charts/charts-content";
import type { DailyLog, InbodyLog } from "@/lib/types/database";

export default async function ChartsPage() {
  const supabase = await createClient();

  const [{ data: dailyLogs }, { data: inbodyLogs }] = await Promise.all([
    supabase
      .from("daily_logs")
      .select("*")
      .order("log_date", { ascending: true }),
    supabase
      .from("inbody_logs")
      .select("*")
      .order("measured_date", { ascending: true }),
  ]);

  return (
    <>
      <Header title="차트" />
      <PageContainer>
        <ChartsContent
          dailyLogs={(dailyLogs || []) as DailyLog[]}
          inbodyLogs={(inbodyLogs || []) as InbodyLog[]}
        />
      </PageContainer>
    </>
  );
}
