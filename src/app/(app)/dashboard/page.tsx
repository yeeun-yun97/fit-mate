import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { DailyChallenge } from "@/components/dashboard/daily-challenge";
import { WeekSelector } from "@/components/dashboard/week-selector";
import { format, subDays } from "date-fns";

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const weekAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");

  const [{ data: todayLog }, { data: weekLogs }] = await Promise.all([
    supabase
      .from("daily_logs")
      .select("id")
      .eq("log_date", today)
      .single(),
    supabase
      .from("daily_logs")
      .select("log_date")
      .gte("log_date", weekAgo)
      .order("log_date", { ascending: false }),
  ]);

  const dailyDates = new Set((weekLogs || []).map((d: { log_date: string }) => d.log_date));

  return (
    <>
      <Header title="FitMate" greeting />
      <PageContainer>
        <div>
          <DailyChallenge hasLoggedToday={!!todayLog} />
          <div className="mt-4">
            <WeekSelector loggedDates={dailyDates} />
          </div>
        </div>
      </PageContainer>
    </>
  );
}
