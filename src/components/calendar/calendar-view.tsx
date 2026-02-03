"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";

interface ConditionData {
  condition_type: string;
  intensity: number;
}

interface DateInfo {
  hasFasting: boolean;
  hasWeight: boolean;
  hasMeal: boolean;
  hasCondition: boolean;
  glucose?: number;
  ketone?: number;
  weight?: number;
  mealCount?: number;
  conditionCount?: number;
  conditions?: ConditionData[];
}

export function CalendarView() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [dateData, setDateData] = useState<Record<string, DateInfo>>({});
  const [loading, setLoading] = useState(true);
  const [showFasting, setShowFasting] = useState(true);
  const [showWeight, setShowWeight] = useState(true);
  const [showMeal, setShowMeal] = useState(true);
  const [availableConditions, setAvailableConditions] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<Set<string>>(new Set());

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
        .select("log_date, fasting_glucose, fasting_ketone")
        .gte("log_date", startDate)
        .lte("log_date", endDate),
      supabase
        .from("timely_weights")
        .select("measured_at, weight")
        .gte("measured_at", `${startDate}T00:00:00+09:00`)
        .lte("measured_at", `${endDate}T23:59:59+09:00`),
      supabase
        .from("timely_meals")
        .select("eaten_at")
        .gte("eaten_at", `${startDate}T00:00:00+09:00`)
        .lte("eaten_at", `${endDate}T23:59:59+09:00`),
      supabase
        .from("timely_body_conditions")
        .select("logged_at, condition_type, intensity")
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
        newDateData[dateStr] = {
          hasFasting: false, hasWeight: false, hasMeal: false, hasCondition: false,
          mealCount: 0, conditionCount: 0
        };
      }
    };

    fastingData?.forEach((d) => {
      ensureDate(d.log_date);
      newDateData[d.log_date].hasFasting = true;
      newDateData[d.log_date].glucose = d.fasting_glucose ?? undefined;
      newDateData[d.log_date].ketone = d.fasting_ketone ?? undefined;
    });

    weightData?.forEach((d) => {
      const dateStr = getKstDateStr(d.measured_at);
      ensureDate(dateStr);
      newDateData[dateStr].hasWeight = true;
      // 마지막 체중값 저장 (같은 날 여러 개면 덮어씀)
      newDateData[dateStr].weight = Number(d.weight);
    });

    mealData?.forEach((d) => {
      const dateStr = getKstDateStr(d.eaten_at);
      ensureDate(dateStr);
      newDateData[dateStr].hasMeal = true;
      newDateData[dateStr].mealCount = (newDateData[dateStr].mealCount || 0) + 1;
    });

    const uniqueConditions = new Set<string>();
    conditionData?.forEach((d) => {
      const dateStr = getKstDateStr(d.logged_at);
      ensureDate(dateStr);
      newDateData[dateStr].hasCondition = true;
      newDateData[dateStr].conditionCount = (newDateData[dateStr].conditionCount || 0) + 1;
      if (!newDateData[dateStr].conditions) {
        newDateData[dateStr].conditions = [];
      }
      newDateData[dateStr].conditions!.push({
        condition_type: d.condition_type,
        intensity: d.intensity,
      });
      uniqueConditions.add(d.condition_type);
    });

    setAvailableConditions(Array.from(uniqueConditions).sort());
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
                    <div className="flex flex-col items-center gap-0 mt-0.5 text-[8px] leading-tight">
                      {showFasting && data.hasFasting && (
                        <span className="text-violet-500 font-medium">
                          {data.glucose ?? "-"}
                        </span>
                      )}
                      {showWeight && data.hasWeight && data.weight && (
                        <span className="text-green-500 font-medium">
                          {data.weight.toFixed(1)}
                        </span>
                      )}
                      {showMeal && data.hasMeal && (
                        <span className="text-orange-500 font-medium">
                          {data.mealCount}끼
                        </span>
                      )}
                      {selectedConditions.size > 0 && data.conditions && (() => {
                        const matched = data.conditions.filter(
                          (c) => selectedConditions.has(c.condition_type)
                        );
                        if (matched.length > 0) {
                          return matched.map((m, i) => (
                            <span key={i} className="text-pink-500 font-medium">
                              {m.intensity}
                            </span>
                          ));
                        }
                        return null;
                      })()}
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

      {/* 필터 */}
      <div className="flex flex-wrap justify-center gap-2 text-xs">
        <button
          onClick={() => setShowFasting(!showFasting)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${
            showFasting
              ? "bg-violet-500 text-white border-violet-500"
              : "bg-transparent text-muted-foreground border-border hover:bg-muted"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${showFasting ? "bg-white" : "bg-violet-400"}`} />
          <span>공복혈액</span>
        </button>
        <button
          onClick={() => setShowWeight(!showWeight)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${
            showWeight
              ? "bg-green-500 text-white border-green-500"
              : "bg-transparent text-muted-foreground border-border hover:bg-muted"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${showWeight ? "bg-white" : "bg-green-400"}`} />
          <span>체중</span>
        </button>
        <button
          onClick={() => setShowMeal(!showMeal)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${
            showMeal
              ? "bg-orange-500 text-white border-orange-500"
              : "bg-transparent text-muted-foreground border-border hover:bg-muted"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${showMeal ? "bg-white" : "bg-orange-400"}`} />
          <span>식단</span>
        </button>
        {availableConditions.map((condition) => {
          const isSelected = selectedConditions.has(condition);
          return (
            <button
              key={condition}
              onClick={() => {
                const newSet = new Set(selectedConditions);
                if (isSelected) {
                  newSet.delete(condition);
                } else {
                  newSet.add(condition);
                }
                setSelectedConditions(newSet);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors ${
                isSelected
                  ? "bg-pink-500 text-white border-pink-500"
                  : "bg-transparent text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-white" : "bg-pink-400"}`} />
              <span>{condition}</span>
            </button>
          );
        })}
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

