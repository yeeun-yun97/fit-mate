import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { DailyChallenge } from "@/components/dashboard/daily-challenge";
import { WeekSelector } from "@/components/dashboard/week-selector";
import { MiniChart } from "@/components/charts/mini-chart";
import { WeightBoxplot } from "@/components/charts/weight-boxplot";
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

  // 더미 데이터 (나중에 DB 연동)
  const dummyChartData = [
    { log_date: format(subDays(new Date(), 6), "yyyy-MM-dd"), fasting_glucose: 95, fasting_ketone: 0.8 },
    { log_date: format(subDays(new Date(), 5), "yyyy-MM-dd"), fasting_glucose: 102, fasting_ketone: 0.5 },
    { log_date: format(subDays(new Date(), 4), "yyyy-MM-dd"), fasting_glucose: 88, fasting_ketone: 1.2 },
    { log_date: format(subDays(new Date(), 3), "yyyy-MM-dd"), fasting_glucose: 91, fasting_ketone: 1.0 },
    { log_date: format(subDays(new Date(), 2), "yyyy-MM-dd"), fasting_glucose: 97, fasting_ketone: 0.7 },
    { log_date: format(subDays(new Date(), 1), "yyyy-MM-dd"), fasting_glucose: 85, fasting_ketone: 1.5 },
    { log_date: format(new Date(), "yyyy-MM-dd"), fasting_glucose: 89, fasting_ketone: 1.3 },
  ];

  // 체중 더미 데이터 (하루에 여러 번 측정, 수염이 확실히 보이게 범위 넓힘)
  const dummyWeightData = [
    { date: format(subDays(new Date(), 6), "M/d"), weights: [54.0, 56.0, 56.5, 57.0, 57.5, 58.0, 60.0] },
    { date: format(subDays(new Date(), 5), "M/d"), weights: [53.5, 55.5, 56.0, 56.5, 57.0, 57.5, 59.5] },
    { date: format(subDays(new Date(), 4), "M/d"), weights: [53.0, 55.0, 55.5, 56.0, 56.5, 57.0, 59.0] },
    { date: format(subDays(new Date(), 3), "M/d"), weights: [52.5, 54.5, 55.0, 55.5, 56.0, 56.5, 58.5] },
    { date: format(subDays(new Date(), 2), "M/d"), weights: [52.0, 54.0, 54.5, 55.0, 55.5, 56.0, 58.0] },
    { date: format(subDays(new Date(), 1), "M/d"), weights: [51.5, 53.5, 54.0, 54.5, 55.0, 55.5, 57.5] },
    { date: format(new Date(), "M/d"), weights: [51.0, 53.0, 53.5, 54.0, 54.5, 55.0, 57.0] },
  ];

  return (
    <>
      <Header title="FitMate" greeting />
      <PageContainer>
        <div>
          <DailyChallenge hasLoggedToday={!!todayLog} />
          <div className="mt-4">
            <WeekSelector loggedDates={dailyDates} />
          </div>
          <div className="mt-6">
            <MiniChart data={dummyChartData as any} />
          </div>
          <div className="mt-4">
            <WeightBoxplot data={dummyWeightData} />
          </div>
        </div>
      </PageContainer>
    </>
  );
}
