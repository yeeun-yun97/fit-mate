import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { DailyLogForm } from "@/components/forms/daily-log-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { DailyLog } from "@/lib/types/database";

export default async function DailyPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("daily_logs")
    .select("*")
    .order("log_date", { ascending: false })
    .limit(30);

  const dailyLogs = (logs || []) as DailyLog[];

  return (
    <>
      <Header title="아침 기록" />
      <PageContainer>
        <div className="space-y-6">
          <DailyLogForm />

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              최근 기록
            </h2>
            {dailyLogs.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  아직 기록이 없습니다. 위에서 첫 기록을 추가하세요!
                </CardContent>
              </Card>
            ) : (
              dailyLogs.map((log) => (
                <Link key={log.id} href={`/daily/${log.id}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {format(new Date(log.log_date + "T00:00:00"), "M월 d일 (EEE)", { locale: ko })}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {log.fasting_glucose && (
                            <span>혈당 <strong className="text-foreground">{log.fasting_glucose}</strong></span>
                          )}
                          {log.fasting_ketone && (
                            <span>케톤 <strong className="text-foreground">{log.fasting_ketone}</strong></span>
                          )}
                        </div>
                      </div>
                      {log.diet_note && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {log.diet_note}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </PageContainer>
    </>
  );
}
