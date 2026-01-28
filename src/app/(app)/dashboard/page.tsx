import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { DailyChallenge } from "@/components/dashboard/daily-challenge";
import { WeekSelector } from "@/components/dashboard/week-selector";
import { TodaySummary } from "@/components/dashboard/today-summary";
import { QuickAdd } from "@/components/dashboard/quick-add";
import { CalendarView } from "@/components/dashboard/calendar-view";
import { RecentEntries } from "@/components/dashboard/recent-entries";
import { MiniChart } from "@/components/charts/mini-chart";
import { format, subDays, eachDayOfInterval } from "date-fns";
import type { DailyLog, PeriodLog, BowelLog } from "@/lib/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const threeMonthsAgo = format(subDays(new Date(), 90), "yyyy-MM-dd");

  const [
    { data: todayLog },
    { data: recentLogs },
    { data: dailyAll },
    { data: periodAll },
    { data: bowelAll },
    { data: chartData },
  ] = await Promise.all([
    supabase
      .from("daily_logs")
      .select("*")
      .eq("log_date", today)
      .single(),
    supabase
      .from("daily_logs")
      .select("*")
      .order("log_date", { ascending: false })
      .limit(5),
    supabase
      .from("daily_logs")
      .select("log_date")
      .gte("log_date", threeMonthsAgo)
      .order("log_date", { ascending: false }),
    supabase
      .from("period_logs")
      .select("start_date, end_date")
      .gte("start_date", threeMonthsAgo)
      .order("start_date", { ascending: false }),
    supabase
      .from("bowel_logs")
      .select("log_date")
      .gte("log_date", threeMonthsAgo)
      .order("log_date", { ascending: false }),
    supabase
      .from("daily_logs")
      .select("log_date, fasting_glucose, fasting_ketone")
      .gte("log_date", format(subDays(new Date(), 14), "yyyy-MM-dd"))
      .order("log_date", { ascending: true }),
  ]);

  const dailyDates = new Set((dailyAll || []).map((d: { log_date: string }) => d.log_date));
  const bowelDates = new Set((bowelAll || []).map((d: { log_date: string }) => d.log_date));

  const periodDates = new Set<string>();
  (periodAll || []).forEach((p: { start_date: string; end_date: string | null }) => {
    const end = p.end_date || p.start_date;
    eachDayOfInterval({
      start: new Date(p.start_date + "T00:00:00"),
      end: new Date(end + "T00:00:00"),
    }).forEach((d) => periodDates.add(format(d, "yyyy-MM-dd")));
  });

  return (
    <>
      <Header title="핏 메이트" greeting />
      <PageContainer>
        <div className="space-y-6">
          <DailyChallenge hasLoggedToday={!!todayLog} />

          <WeekSelector loggedDates={dailyDates} />

          <TodaySummary todayLog={todayLog as DailyLog | null} />

          <QuickAdd />

          <MiniChart data={(chartData || []) as DailyLog[]} />

          <CalendarView
            dailyDates={dailyDates}
            periodDates={periodDates}
            bowelDates={bowelDates}
          />

          <div>
            <h2 className="text-sm font-bold text-foreground mb-3">
              최근 기록
            </h2>
            <RecentEntries logs={(recentLogs || []) as DailyLog[]} />
          </div>
        </div>
      </PageContainer>
    </>
  );
}
