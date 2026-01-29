"use client";

import { useState, useEffect, useCallback } from "react";
import { format, subDays, addDays, isToday } from "date-fns";
import { ko } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { evaluateGlucose, evaluateKetone, getScoreColor } from "@/lib/evaluations/fasting";
import { FastingEditSheet } from "@/components/sheets/fasting-edit-sheet";
import type { DailyFasting } from "@/lib/types/database";

// 더미 데이터 (공복 혈액 제외)
const dummyData = {
  weights: [
    { id: 1, value: 55.8, time: "07:30" },
    { id: 2, value: 56.1, time: "12:45" },
    { id: 3, value: 56.3, time: "19:20" },
  ],
  bodyConditions: [
    { id: 1, type: "생리 시작", time: "08:00" },
    { id: 2, type: "두통", time: "14:30" },
  ],
  emotionConditions: [
    { id: 1, type: "기분 좋음", time: "09:00" },
    { id: 2, type: "스트레스", time: "15:00" },
  ],
  meals: [
    { id: 1, name: "아보카도 샐러드", time: "08:30" },
    { id: 2, name: "닭가슴살 도시락", time: "12:30" },
    { id: 3, name: "연어 스테이크", time: "18:45" },
  ],
  review: {
    rating: 4,
    goodPoints: "식단 조절을 잘 지켰고, 운동도 계획대로 완료했다.",
    badPoints: "물을 충분히 마시지 못했다.",
  },
};

export function TodayContent() {
  const [data, setData] = useState(dummyData);
  const [fastingData, setFastingData] = useState<DailyFasting | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [fastingSheetOpen, setFastingSheetOpen] = useState(false);

  // 공복 혈액 데이터 가져오기
  const fetchFastingData = useCallback(async () => {
    const supabase = createClient();
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    const { data } = await supabase
      .from("daily_fastings")
      .select("*")
      .eq("log_date", dateStr)
      .single();

    setFastingData(data);
  }, [selectedDate]);

  // 날짜가 변경될 때마다 공복 혈액 데이터 가져오기
  useEffect(() => {
    fetchFastingData();
  }, [fetchFastingData]);

  const canGoNext = !isToday(selectedDate);

  const goToPrevDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const goToNextDay = () => {
    if (canGoNext) {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  return (
    <div className="space-y-4">
      {/* 날짜 선택 */}
      <div className="flex justify-end">
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrevDay}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4 text-foreground" />
          </button>
          <span className="text-sm font-medium text-foreground min-w-[120px] text-center">
            {format(selectedDate, "M월 d일 (EEE)", { locale: ko })}
          </span>
          <button
            onClick={goToNextDay}
            disabled={!canGoNext}
            className={`p-1.5 rounded-full transition-colors ${
              canGoNext ? "hover:bg-muted" : "opacity-30 cursor-not-allowed"
            }`}
          >
            <ChevronRightIcon className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* 공복 혈액 */}
      <div className="rounded-2xl bg-card border border-border/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground">공복 혈액</h3>
          <button
            onClick={() => setFastingSheetOpen(true)}
            className="text-xs text-primary font-medium"
          >
            수정
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">혈당</p>
            {fastingData?.fasting_glucose ? (
              <>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">
                    {fastingData.fasting_glucose} mg/dL
                  </p>
                  <span className={`text-sm font-bold ${getScoreColor(evaluateGlucose(Number(fastingData.fasting_glucose)).score)}`}>
                    {evaluateGlucose(Number(fastingData.fasting_glucose)).score}점
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {evaluateGlucose(Number(fastingData.fasting_glucose)).reason}
                </p>
              </>
            ) : (
              <p className="text-lg font-semibold text-muted-foreground">미입력</p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">케톤</p>
            {fastingData?.fasting_ketone ? (
              <>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">
                    {fastingData.fasting_ketone} mmol/L
                  </p>
                  <span className={`text-sm font-bold ${getScoreColor(evaluateKetone(Number(fastingData.fasting_ketone)).score)}`}>
                    {evaluateKetone(Number(fastingData.fasting_ketone)).score}점
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {evaluateKetone(Number(fastingData.fasting_ketone)).reason}
                </p>
              </>
            ) : (
              <p className="text-lg font-semibold text-muted-foreground">미입력</p>
            )}
          </div>
        </div>
      </div>

      {/* 체중 목록 */}
      <div className="rounded-2xl bg-card border border-border/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground">체중</h3>
          <button
            onClick={() => setEditingSection("weight-add")}
            className="text-xs text-primary font-medium"
          >
            + 추가
          </button>
        </div>
        {data.weights.length > 0 ? (
          <div className="space-y-2">
            {data.weights.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{w.time}</span>
                  <span className="text-sm font-medium">{w.value} kg</span>
                </div>
                <button
                  onClick={() => setEditingSection(`weight-${w.id}`)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  수정
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">입력된 체중이 없습니다</p>
        )}
      </div>

      {/* 신체 컨디션 */}
      <div className="rounded-2xl bg-card border border-border/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground">신체 컨디션</h3>
          <button
            onClick={() => setEditingSection("body-condition-add")}
            className="text-xs text-primary font-medium"
          >
            + 추가
          </button>
        </div>
        {data.bodyConditions.length > 0 ? (
          <div className="space-y-2">
            {data.bodyConditions.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{e.time}</span>
                  <span className="text-sm font-medium">{e.type}</span>
                </div>
                <button
                  onClick={() => setEditingSection(`body-condition-${e.id}`)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  수정
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">입력된 컨디션이 없습니다</p>
        )}
      </div>

      {/* 감정 컨디션 */}
      <div className="rounded-2xl bg-card border border-border/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground">감정 컨디션</h3>
          <button
            onClick={() => setEditingSection("emotion-condition-add")}
            className="text-xs text-primary font-medium"
          >
            + 추가
          </button>
        </div>
        {data.emotionConditions.length > 0 ? (
          <div className="space-y-2">
            {data.emotionConditions.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{e.time}</span>
                  <span className="text-sm font-medium">{e.type}</span>
                </div>
                <button
                  onClick={() => setEditingSection(`emotion-condition-${e.id}`)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  수정
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">입력된 컨디션이 없습니다</p>
        )}
      </div>

      {/* 식단 */}
      <div className="rounded-2xl bg-card border border-border/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground">식단</h3>
          <button
            onClick={() => setEditingSection("meal-add")}
            className="text-xs text-primary font-medium"
          >
            + 추가
          </button>
        </div>
        {data.meals.length > 0 ? (
          <div className="space-y-2">
            {data.meals.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{m.time}</span>
                  <span className="text-sm font-medium">{m.name}</span>
                </div>
                <button
                  onClick={() => setEditingSection(`meal-${m.id}`)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  수정
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">입력된 식단이 없습니다</p>
        )}
      </div>

      {/* 하루 리뷰 */}
      <div className="rounded-2xl bg-card border border-border/50 p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">하루 리뷰</h3>
        {data.review ? (
          <div className="space-y-3">
            {/* 별점 */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className="w-5 h-5"
                  filled={star <= data.review.rating}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-1">
                {data.review.rating}/5
              </span>
            </div>
            {/* 잘한 점 */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">잘한 점</p>
              <p className="text-sm">{data.review.goodPoints || "미입력"}</p>
            </div>
            {/* 못한 점 */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">못한 점</p>
              <p className="text-sm">{data.review.badPoints || "미입력"}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">오늘 하루를 돌아보세요</p>
        )}
      </div>

      {/* 공복 혈액 수정 바텀 시트 */}
      <FastingEditSheet
        open={fastingSheetOpen}
        onOpenChange={setFastingSheetOpen}
        date={format(selectedDate, "yyyy-MM-dd")}
        initialData={
          fastingData
            ? {
                fasting_glucose: fastingData.fasting_glucose,
                fasting_ketone: fastingData.fasting_ketone,
              }
            : undefined
        }
        onSaved={fetchFastingData}
      />
    </div>
  );
}

function StarIcon({ className, filled }: { className?: string; filled: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "#facc15" : "none"}
      stroke={filled ? "#facc15" : "currentColor"}
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
      />
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

function DataCard({
  title,
  value,
  onEdit,
  isEmpty,
}: {
  title: string;
  value: string;
  onEdit: () => void;
  isEmpty: boolean;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground mb-1">{title}</h3>
          <p className={`text-lg font-semibold ${isEmpty ? "text-muted-foreground" : ""}`}>
            {value}
          </p>
        </div>
        <button
          onClick={onEdit}
          className="text-xs text-primary font-medium"
        >
          {isEmpty ? "+ 추가" : "수정"}
        </button>
      </div>
    </div>
  );
}
