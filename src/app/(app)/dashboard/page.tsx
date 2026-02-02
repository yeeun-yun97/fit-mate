import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { DailyChallenge } from "@/components/dashboard/daily-challenge";
import { ReviewReminder } from "@/components/dashboard/review-reminder";
import { WeekSelector } from "@/components/dashboard/week-selector";
import { MiniChart } from "@/components/charts/mini-chart";
import { WeightBoxplot } from "@/components/charts/weight-boxplot";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 한국 시간(KST) 기준으로 날짜 계산
  const kstFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' });
  const today = kstFormatter.format(new Date());
  const yesterday = kstFormatter.format(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const weekAgo = kstFormatter.format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

  // 체중 조회용: 한국시간 자정을 UTC로 변환
  const weightStartUtc = `${weekAgo}T00:00:00+09:00`;

  const [{ data: todayLog }, { data: weekLogs }, { data: fastingData }, { data: weightData }, { data: yesterdayReview }] = await Promise.all([
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
      .gte("measured_at", weightStartUtc)
      .order("measured_at", { ascending: true }),
    supabase
      .from("daily_reviews")
      .select("id")
      .eq("review_date", yesterday)
      .single(),
  ]);

  const dailyDates = new Set((weekLogs || []).map((d: { log_date: string }) => d.log_date));

  // 체중 데이터를 시간순으로 정렬 (한국 시간대 기준)
  const chartWeightData = (weightData || []).map((item) => {
    const utcMs = Date.parse(item.measured_at);
    const kstMs = utcMs + 9 * 60 * 60 * 1000;
    const kstDate = new Date(kstMs);
    const label = `${kstDate.getUTCMonth() + 1}/${kstDate.getUTCDate()} ${String(kstDate.getUTCHours()).padStart(2, '0')}:${String(kstDate.getUTCMinutes()).padStart(2, '0')}`;
    return {
      label,
      weight: Number(item.weight),
      measured_at: item.measured_at,
    };
  });

  return (
    <>
      <Header title="FitMate" greeting />
      <PageContainer>
        <div>
          <DailyChallenge hasLoggedToday={!!todayLog} />
          <div className="mt-4">
            <ReviewReminder hasYesterdayReview={!!yesterdayReview} />
          </div>
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
