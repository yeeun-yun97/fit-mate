import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { DailyLog } from "@/lib/types/database";

interface Props {
  todayLog: DailyLog | null;
}

export function TodaySummary({ todayLog }: Props) {
  if (!todayLog) {
    return (
      <Card className="border-primary/30 bg-accent/30">
        <CardContent className="py-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">오늘 아침 기록이 없습니다</p>
          <Link href="/daily">
            <Button size="sm">지금 기록하기</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-accent/30">
      <CardContent className="py-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground">오늘의 기록</h3>
          <Link href={`/daily/${todayLog.id}`} className="text-xs text-primary hover:underline">
            수정
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-muted-foreground">공복 혈당</p>
            <p className="text-lg font-bold text-foreground">
              {todayLog.fasting_glucose ?? "-"} <span className="text-xs font-normal text-muted-foreground">mg/dL</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">공복 케톤</p>
            <p className="text-lg font-bold text-foreground">
              {todayLog.fasting_ketone ?? "-"} <span className="text-xs font-normal text-muted-foreground">mmol/L</span>
            </p>
          </div>
        </div>
        {todayLog.diet_note && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{todayLog.diet_note}</p>
        )}
      </CardContent>
    </Card>
  );
}
