"use client";

import { format, subDays } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Props {
  loggedDates: Set<string>;
}

export function WeekSelector({ loggedDates }: Props) {
  // KST 기준 오늘 날짜
  const kstDateStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
  const today = new Date(kstDateStr + "T00:00:00");
  // 오늘이 맨 오른쪽, 과거 6일 + 오늘 = 7일
  const days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

  return (
    <div className="flex items-center justify-between gap-1.5 px-1">
      {days.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const isToday = dateStr === kstDateStr;
        const hasLog = loggedDates.has(dateStr);

        return (
          <div
            key={dateStr}
            className={cn(
              "flex flex-col items-center gap-1 py-2 px-2.5 rounded-2xl transition-all flex-1",
              isToday
                ? "bg-foreground text-background shadow-md"
                : "bg-card text-foreground"
            )}
          >
            <span className={cn(
              "text-[10px] font-medium uppercase",
              isToday ? "text-background/70" : "text-muted-foreground"
            )}>
              {format(day, "EEE", { locale: ko })}
            </span>
            <span className={cn(
              "text-sm font-bold",
              isToday ? "text-background" : "text-foreground"
            )}>
              {format(day, "d")}
            </span>
            {hasLog && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </div>
        );
      })}
    </div>
  );
}
