"use client";

import { useState, useRef, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  name: string;
  value: string;
  onChange: (date: string) => void;
}

export function DatePicker({ name, value, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() =>
    value ? new Date(value + "T00:00:00") : new Date()
  );
  const ref = useRef<HTMLDivElement>(null);

  const selected = value ? new Date(value + "T00:00:00") : null;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const weekDays = ["월", "화", "수", "목", "금", "토", "일"];

  function pick(day: Date) {
    onChange(format(day, "yyyy-MM-dd"));
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          if (selected) setViewMonth(selected);
        }}
        className={cn(
          "w-full flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5 text-sm transition-colors",
          "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring",
          !value && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
        {value
          ? format(new Date(value + "T00:00:00"), "yyyy년 M월 d일 (EEE)", { locale: ko })
          : "날짜를 선택하세요"}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 left-0 right-0 bg-card border border-border rounded-2xl shadow-lg p-4 animate-in fade-in-0 zoom-in-95">
          {/* header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewMonth(subMonths(viewMonth, 1))}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-foreground">
              {format(viewMonth, "yyyy년 M월", { locale: ko })}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth(addMonths(viewMonth, 1))}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>

          {/* weekday labels */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDays.map((d) => (
              <div key={d} className="text-[10px] text-center text-muted-foreground font-semibold py-1">
                {d}
              </div>
            ))}
          </div>

          {/* days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const inMonth = isSameMonth(day, viewMonth);
              const isSelected = selected && isSameDay(day, selected);
              const today = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => pick(day)}
                  className={cn(
                    "w-full aspect-square flex items-center justify-center rounded-xl text-xs transition-colors",
                    !inMonth && "opacity-25",
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold"
                      : today
                        ? "bg-foreground text-background font-bold"
                        : "hover:bg-muted text-foreground"
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          {/* today shortcut */}
          <button
            type="button"
            onClick={() => {
              const todayStr = format(new Date(), "yyyy-MM-dd");
              onChange(todayStr);
              setOpen(false);
            }}
            className="w-full mt-3 pt-3 border-t border-border text-xs font-semibold text-primary hover:underline"
          >
            오늘 날짜로 설정
          </button>
        </div>
      )}
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
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
