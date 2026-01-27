"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { PeriodLogForm } from "@/components/forms/period-log-form";
import { BowelLogForm } from "@/components/forms/bowel-log-form";
import { DeleteButton } from "@/components/forms/delete-button";
import { deletePeriodLog } from "@/actions/period-log";
import { deleteBowelLog } from "@/actions/bowel-log";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { PeriodLog, BowelLog } from "@/lib/types/database";

interface Props {
  periodLogs: PeriodLog[];
  bowelLogs: BowelLog[];
}

export function TrackingContent({ periodLogs, bowelLogs }: Props) {
  return (
    <Tabs defaultValue="period" className="space-y-4">
      <TabsList className="w-full">
        <TabsTrigger value="period" className="flex-1">생리 기록</TabsTrigger>
        <TabsTrigger value="bowel" className="flex-1">배변 기록</TabsTrigger>
      </TabsList>

      <TabsContent value="period" className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <PeriodLogForm />
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            최근 생리 기록
          </h2>
          {periodLogs.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground text-sm">
                기록이 없습니다
              </CardContent>
            </Card>
          ) : (
            periodLogs.map((log) => (
              <Card key={log.id}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">
                        {format(new Date(log.start_date + "T00:00:00"), "M월 d일", { locale: ko })}
                      </span>
                      {log.end_date ? (
                        <span className="text-sm text-muted-foreground">
                          {" ~ "}
                          {format(new Date(log.end_date + "T00:00:00"), "M월 d일", { locale: ko })}
                        </span>
                      ) : (
                        <span className="text-xs ml-2 text-primary font-medium">진행 중</span>
                      )}
                    </div>
                    <DeleteButton id={log.id} action={deletePeriodLog} redirectTo="/tracking" />
                  </div>
                  {log.note && (
                    <p className="text-xs text-muted-foreground mt-1">{log.note}</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="bowel" className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <BowelLogForm />
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            최근 배변 기록
          </h2>
          {bowelLogs.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground text-sm">
                기록이 없습니다
              </CardContent>
            </Card>
          ) : (
            bowelLogs.map((log) => (
              <Card key={log.id}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">
                        {format(new Date(log.log_date + "T00:00:00"), "M월 d일 (EEE)", { locale: ko })}
                      </span>
                      {log.log_time && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {log.log_time.slice(0, 5)}
                        </span>
                      )}
                    </div>
                    <DeleteButton id={log.id} action={deleteBowelLog} redirectTo="/tracking" />
                  </div>
                  {log.note && (
                    <p className="text-xs text-muted-foreground mt-1">{log.note}</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
