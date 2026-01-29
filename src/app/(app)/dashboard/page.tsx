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

  const [{ data: todayLog }, { data: weekLogs }, { data: fastingData }, { data: weightData }] = await Promise.all([
    supabase
      .from("daily_fastings")
      .select("id")
      .eq("log_date", today)
      .single(),
    supabase
      .from("daily_fastings")
      .select("log_date")
      .gte("log_date", weekAgo)
      .order("log_date", { ascending: false }),
    supabase
      .from("daily_fastings")
      .select("*")
      .gte("log_date", weekAgo)
      .order("log_date", { ascending: true }),
    supabase
      .from("timely_weights")
      .select("measured_at, weight")
      .gte("measured_at", `${weekAgo}T00:00:00`)
      .order("measured_at", { ascending: true }),
  ]);

  const dailyDates = new Set((weekLogs || []).map((d: { log_date: string }) => d.log_date));

  // 체중 데이터를 날짜별로 그룹화 (한국 시간대 기준)
  const weightByDate = (weightData || []).reduce((acc, item) => {
    // UTC를 한국 시간(+9)으로 변환
    const utcDate = new Date(item.measured_at);
    const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
    const date = format(kstDate, "M/d");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(Number(item.weight));
    return acc;
  }, {} as Record<string, number[]>);

  // 데이터가 있는 날짜만 표시
  const chartWeightData = Object.entries(weightByDate)
    .map(([date, weights]) => ({ date, weights }))
    .sort((a, b) => {
      // 날짜순 정렬 (M/d 형식)
      const [aMonth, aDay] = a.date.split("/").map(Number);
      const [bMonth, bDay] = b.date.split("/").map(Number);
      return aMonth !== bMonth ? aMonth - bMonth : aDay - bDay;
    });

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
            <MiniChart data={fastingData || []} />
          </div>
          <div className="mt-4">
            <WeightBoxplot data={chartWeightData} />
          </div>
        </div>
      </PageContainer>
    </>
  );
}
