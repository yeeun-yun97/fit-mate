import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { PageContainer } from "@/components/layout/page-container";
import { InbodyLogForm } from "@/components/forms/inbody-log-form";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { InbodyLog } from "@/lib/types/database";

export default async function InbodyPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("inbody_logs")
    .select("*")
    .order("measured_date", { ascending: false })
    .limit(20);

  const inbodyLogs = (logs || []) as InbodyLog[];

  return (
    <>
      <Header title="인바디 기록" />
      <PageContainer>
        <div className="space-y-6">
          <InbodyLogForm />

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              측정 기록
            </h2>
            {inbodyLogs.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  아직 인바디 기록이 없습니다.
                </CardContent>
              </Card>
            ) : (
              inbodyLogs.map((log) => (
                <Link key={log.id} href={`/inbody/${log.id}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">
                          {format(new Date(log.measured_date + "T00:00:00"), "M월 d일 (EEE)", { locale: ko })}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        {log.skeletal_muscle_mass && (
                          <span>골격근 <strong className="text-foreground">{log.skeletal_muscle_mass}kg</strong></span>
                        )}
                        {log.body_fat_mass && (
                          <span>체지방 <strong className="text-foreground">{log.body_fat_mass}kg</strong></span>
                        )}
                        {log.body_fat_pct && (
                          <span>체지방률 <strong className="text-foreground">{log.body_fat_pct}%</strong></span>
                        )}
                      </div>
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
