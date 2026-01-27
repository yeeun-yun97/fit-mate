"use client";

import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  dailyDates: Set<string>;
  periodDates: Set<string>;
  bowelDates: Set<string>;
}

export function CalendarView({ dailyDates, periodDates, bowelDates }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const weekDays = ["월", "화", "수", "목", "금", "토", "일"];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            &lt;
          </Button>
          <CardTitle className="text-sm font-semibold">
            {format(currentMonth, "yyyy년 M월", { locale: ko })}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            &gt;
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((d) => (
            <div key={d} className="text-[10px] text-center text-muted-foreground font-medium py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            const hasDaily = dailyDates.has(dateStr);
            const hasPeriod = periodDates.has(dateStr);
            const hasBowel = bowelDates.has(dateStr);

            return (
              <div
                key={dateStr}
                className={cn(
                  "relative flex flex-col items-center py-1.5 rounded-md text-xs",
                  !inMonth && "opacity-30",
                  today && "bg-primary/10 font-bold"
                )}
              >
                <span className={cn(today && "text-primary")}>{format(day, "d")}</span>
                <div className="flex gap-0.5 mt-0.5">
                  {hasDaily && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                  {hasPeriod && <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />}
                  {hasBowel && <span className="w-1.5 h-1.5 rounded-full bg-amber-700" />}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
