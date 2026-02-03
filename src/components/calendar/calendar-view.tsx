"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";

interface DateInfo {
  hasFasting: boolean;
  hasWeight: boolean;
  hasMeal: boolean;
  hasCondition: boolean;
}

export function CalendarView() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [dateData, setDateData] = useState<Record<string, DateInfo>>({});
  const [loading, setLoading] = useState(true);

  const minYear = 2026;
  const minMonth = 0; // 1월

  const canGoPrev = year > minYear || (year === minYear && month > minMonth);
  const canGoNext = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth());

  const goToPrevMonth = () => {
    if (!canGoPrev) return;
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNextMonth = () => {
    if (!canGoNext) return;
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    const startDate = format(startOfMonth, "yyyy-MM-dd");
    const endDate = format(endOfMonth, "yyyy-MM-dd");

    const [
      { data: fastingData },
      { data: weightData },
      { data: mealData },
      { data: conditionData },
    ] = await Promise.all([
      supabase
        .from("daily_fastings")
        .select("log_date")
        .gte("log_date", startDate)
        .lte("log_date", endDate),
      supabase
        .from("timely_weights")
        .select("measured_at")
        .gte("measured_at", `${startDate}T00:00:00+09:00`)
        .lte("measured_at", `${endDate}T23:59:59+09:00`),
      supabase
        .from("timely_meals")
        .select("eaten_at")
        .gte("eaten_at", `${startDate}T00:00:00+09:00`)
        .lte("eaten_at", `${endDate}T23:59:59+09:00`),
      supabase
        .from("timely_body_conditions")
        .select("logged_at")
        .gte("logged_at", `${startDate}T00:00:00+09:00`)
        .lte("logged_at", `${endDate}T23:59:59+09:00`),
    ]);

    const newDateData: Record<string, DateInfo> = {};

    const getKstDateStr = (utcStr: string) => {
      const utcMs = Date.parse(utcStr);
      const kstMs = utcMs + 9 * 60 * 60 * 1000;
      const kstDate = new Date(kstMs);
      return `${kstDate.getUTCFullYear()}-${String(kstDate.getUTCMonth() + 1).padStart(2, '0')}-${String(kstDate.getUTCDate()).padStart(2, '0')}`;
    };

    const ensureDate = (dateStr: string) => {
      if (!newDateData[dateStr]) {
        newDateData[dateStr] = { hasFasting: false, hasWeight: false, hasMeal: false, hasCondition: false };
      }
    };

    fastingData?.forEach((d) => {
      ensureDate(d.log_date);
      newDateData[d.log_date].hasFasting = true;
    });

    weightData?.forEach((d) => {
      const dateStr = getKstDateStr(d.measured_at);
      ensureDate(dateStr);
      newDateData[dateStr].hasWeight = true;
    });

    mealData?.forEach((d) => {
      const dateStr = getKstDateStr(d.eaten_at);
      ensureDate(dateStr);
      newDateData[dateStr].hasMeal = true;
    });

    conditionData?.forEach((d) => {
      const dateStr = getKstDateStr(d.logged_at);
      ensureDate(dateStr);
      newDateData[dateStr].hasCondition = true;
    });

    setDateData(newDateData);
    setLoading(false);
  }, [year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  // 달력 생성
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const prevMonthDays: number[] = [];
  if (startDayOfWeek > 0) {
    const prevLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      prevMonthDays.push(prevLastDay - i);
    }
  }

  const currentMonthDays: number[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonthDays.push(i);
  }

  const totalCells = prevMonthDays.length + currentMonthDays.length;
  const nextMonthDays: number[] = [];
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remainingCells; i++) {
    nextMonthDays.push(i);
  }

  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

  const getDateStr = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* 월 선택 */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          className={`p-2 rounded-full transition-colors ${
            canGoPrev ? "hover:bg-muted" : "opacity-30 cursor-not-allowed"
          }`}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-foreground min-w-[140px] text-center">
          {format(firstDay, "yyyy년 M월", { locale: ko })}
        </h2>
        <button
          onClick={goToNextMonth}
          disabled={!canGoNext}
          className={`p-2 rounded-full transition-colors ${
            canGoNext ? "hover:bg-muted" : "opacity-30 cursor-not-allowed"
          }`}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 달력 */}
      <div className="rounded-2xl bg-card border border-border/50 p-4">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 mb-2">
          {weekdays.map((day, i) => (
            <div
              key={day}
              className={`text-center text-xs font-medium py-2 ${
                i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-muted-foreground"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {/* 이전 달 */}
          {prevMonthDays.map((day) => (
            <div key={`prev-${day}`} className="aspect-square p-1">
              <div className="h-full flex flex-col items-center justify-start pt-1">
                <span className="text-xs text-muted-foreground/40">{day}</span>
              </div>
            </div>
          ))}

          {/* 이번 달 */}
          {currentMonthDays.map((day) => {
            const dateStr = getDateStr(day);
            const data = dateData[dateStr];
            const isToday = dateStr === todayStr;
            const isFuture = new Date(dateStr) > today;
            const dayOfWeek = new Date(year, month, day).getDay();

            return (
              <Link
                key={day}
                href={`/today?date=${dateStr}`}
                className={`aspect-square p-1 rounded-lg transition-colors ${
                  isFuture ? "pointer-events-none" : "hover:bg-muted"
                }`}
              >
                <div className="h-full flex flex-col items-center justify-start pt-1">
                  <span
                    className={`text-xs font-medium ${
                      isToday
                        ? "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center"
                        : isFuture
                        ? "text-muted-foreground/40"
                        : dayOfWeek === 0
                        ? "text-red-400"
                        : dayOfWeek === 6
                        ? "text-blue-400"
                        : "text-foreground"
                    }`}
                  >
                    {day}
                  </span>

                  {/* 기록 표시 */}
                  {data && !isFuture && !loading && (
                    <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                      {data.hasFasting && (
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                      )}
                      {data.hasWeight && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      )}
                      {data.hasMeal && (
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      )}
                      {data.hasCondition && (
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}

          {/* 다음 달 */}
          {nextMonthDays.map((day) => (
            <div key={`next-${day}`} className="aspect-square p-1">
              <div className="h-full flex flex-col items-center justify-start pt-1">
                <span className="text-xs text-muted-foreground/40">{day}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-violet-400" />
          <span>공복혈액</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span>체중</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          <span>식단</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-pink-400" />
          <span>컨디션</span>
        </div>
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
