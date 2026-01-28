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
    <div className="rounded-2xl bg-card border border-border/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <h3 className="text-sm font-bold text-foreground">
          {format(currentMonth, "yyyy년 M월", { locale: ko })}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((d) => (
          <div key={d} className="text-[10px] text-center text-muted-foreground font-semibold py-1">
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
                "relative flex flex-col items-center py-2 rounded-xl text-xs transition-colors",
                !inMonth && "opacity-25",
                today && "bg-foreground text-background font-bold",
              )}
            >
              <span>{format(day, "d")}</span>
              <div className="flex gap-0.5 mt-0.5 h-1.5">
                {hasDaily && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                {hasPeriod && <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />}
                {hasBowel && <span className="w-1.5 h-1.5 rounded-full bg-amber-700" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border/50">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-blue-500" /> 기록
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-pink-500" /> 생리
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-amber-700" /> 배변
        </span>
      </div>
    </div>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}
