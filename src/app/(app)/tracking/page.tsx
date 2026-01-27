import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { TrackingContent } from "@/components/forms/tracking-content";
import type { PeriodLog, BowelLog } from "@/lib/types/database";

export default async function TrackingPage() {
  const supabase = await createClient();

  const [{ data: periodLogs }, { data: bowelLogs }] = await Promise.all([
    supabase
      .from("period_logs")
      .select("*")
      .order("start_date", { ascending: false })
      .limit(20),
    supabase
      .from("bowel_logs")
      .select("*")
      .order("log_date", { ascending: false })
      .limit(30),
  ]);

  return (
    <>
      <Header title="추가 기록" />
      <PageContainer>
        <TrackingContent
          periodLogs={(periodLogs || []) as PeriodLog[]}
          bowelLogs={(bowelLogs || []) as BowelLog[]}
        />
      </PageContainer>
    </>
  );
}
