import Link from "next/link";
import type { DailyFasting } from "@/lib/types/database";

interface Props {
  todayLog: DailyFasting | null;
}

export function TodaySummary({ todayLog }: Props) {
  if (!todayLog) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-foreground">오늘의 수치</h2>
        <Link href={`/daily/${todayLog.id}`} className="text-xs text-primary font-medium hover:underline">
          수정하기 &rsaquo;
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-secondary p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-sm">🩸</span>
            <span className="text-xs text-muted-foreground font-medium">공복 혈당</span>
          </div>
          <p className="text-2xl font-extrabold text-foreground">
            {todayLog.fasting_glucose ?? "-"}
            <span className="text-xs font-normal text-muted-foreground ml-1">mg/dL</span>
          </p>
        </div>
        <div className="rounded-2xl bg-secondary p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-sm">⚡</span>
            <span className="text-xs text-muted-foreground font-medium">공복 케톤</span>
          </div>
          <p className="text-2xl font-extrabold text-foreground">
            {todayLog.fasting_ketone ?? "-"}
            <span className="text-xs font-normal text-muted-foreground ml-1">mmol/L</span>
          </p>
        </div>
      </div>
    </div>
  );
}
