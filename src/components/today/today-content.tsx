"use client";

import { useState, useEffect, useCallback } from "react";
import { format, subDays, addDays, isToday } from "date-fns";
import { ko } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { evaluateGlucose, evaluateKetone, evaluateMetabolicState } from "@/lib/evaluations/fasting";
import { EmptyState } from "@/components/ui/empty-state";
import { FastingEditSheet } from "@/components/sheets/fasting-edit-sheet";
import { WeightEditSheet } from "@/components/sheets/weight-edit-sheet";
import { MealEditSheet } from "@/components/sheets/meal-edit-sheet";
import type { DailyFasting } from "@/lib/types/database";

interface WeightEntry {
  id: string;
  weight: number;
  measured_at: string;
}

interface MealEntry {
  id: string;
  foods: string[];
  eaten_at: string;
  progress: number;
}

// 더미 데이터 (공복 혈액, 체중, 식단 제외)
const dummyData = {
  bodyConditions: [
    { id: 1, type: "생리 시작", time: "08:00" },
    { id: 2, type: "두통", time: "14:30" },
  ],
  emotionConditions: [
    { id: 1, type: "기분 좋음", time: "09:00" },
    { id: 2, type: "스트레스", time: "15:00" },
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
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [fastingSheetOpen, setFastingSheetOpen] = useState(false);
  const [weightSheetOpen, setWeightSheetOpen] = useState(false);
  const [mealSheetOpen, setMealSheetOpen] = useState(false);
  const [editingWeight, setEditingWeight] = useState<WeightEntry | null>(null);
  const [editingMeal, setEditingMeal] = useState<MealEntry | null>(null);

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

  // 체중 데이터 가져오기
  const fetchWeightData = useCallback(async () => {
    const supabase = createClient();
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const nextDateStr = format(addDays(selectedDate, 1), "yyyy-MM-dd");

    const { data } = await supabase
      .from("timely_weights")
      .select("id, weight, measured_at")
      .gte("measured_at", dateStr)
      .lt("measured_at", nextDateStr)
      .order("measured_at", { ascending: true });

    setWeights(data || []);
  }, [selectedDate]);

  // 식단 데이터 가져오기
  const fetchMealData = useCallback(async () => {
    const supabase = createClient();
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const nextDateStr = format(addDays(selectedDate, 1), "yyyy-MM-dd");

    const { data } = await supabase
      .from("timely_meals")
      .select("id, foods, eaten_at, progress")
      .gte("eaten_at", dateStr)
      .lt("eaten_at", nextDateStr)
      .order("eaten_at", { ascending: true });

    setMeals(data || []);
  }, [selectedDate]);

  // 날짜가 변경될 때마다 데이터 가져오기
  useEffect(() => {
    fetchFastingData();
    fetchWeightData();
    fetchMealData();
  }, [fetchFastingData, fetchWeightData, fetchMealData]);

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
          {(fastingData?.fasting_glucose != null || fastingData?.fasting_ketone != null) && (
            <button
              onClick={() => setFastingSheetOpen(true)}
              className="text-xs text-primary font-medium"
            >
              수정
            </button>
          )}
        </div>
        {fastingData?.fasting_glucose != null || fastingData?.fasting_ketone != null ? (
          <div className="grid grid-cols-2 gap-3">
            {/* 혈당 - 보라색 */}
            <div className="rounded-xl bg-violet-500/10 p-3">
              <div className="flex items-center gap-3">
                <CircularScore
                  score={evaluateGlucose(Number(fastingData?.fasting_glucose ?? 0)).score}
                  color="violet"
                />
                <div>
                  <p className="text-xl font-bold text-violet-600 dark:text-violet-400">
                    {fastingData?.fasting_glucose ?? 0}
                    <span className="text-xs font-normal ml-1">mg/dL</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {evaluateGlucose(Number(fastingData?.fasting_glucose ?? 0)).reason}
                  </p>
                </div>
              </div>
            </div>
            {/* 케톤 - 주황색 */}
            <div className="rounded-xl bg-orange-500/10 p-3">
              <div className="flex items-center gap-3">
                <CircularScore
                  score={evaluateKetone(Number(fastingData?.fasting_ketone ?? 0)).score}
                  color="orange"
                />
                <div>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {fastingData?.fasting_ketone ?? 0}
                    <span className="text-xs font-normal ml-1">mmol/L</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {evaluateKetone(Number(fastingData?.fasting_ketone ?? 0)).reason}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            label="기록하기"
            onClick={() => setFastingSheetOpen(true)}
          />
        )}
        {/* 대사 상태 메시지 */}
        {fastingData?.fasting_glucose != null && fastingData?.fasting_ketone != null && (
          <div className="mt-3 pt-3 border-t border-border/50">
            {(() => {
              const metabolic = evaluateMetabolicState(
                Number(fastingData.fasting_glucose),
                Number(fastingData.fasting_ketone)
              );
              const stateColor = metabolic.score >= 4
                ? "bg-green-500/15 text-green-600 dark:text-green-400"
                : metabolic.score === 3
                ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400"
                : "bg-red-500/15 text-red-600 dark:text-red-400";
              return (
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stateColor}`}>
                    {metabolic.state}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {metabolic.reason}
                  </p>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* 식단 */}
      <div className="rounded-2xl bg-card border border-border/50 p-4">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-foreground">식단</h3>
        </div>
        {meals.length > 0 ? (
          <div className="space-y-2">
            {meals.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(m.eaten_at), "HH:mm")}
                  </span>
                  <span className="text-sm font-medium">{m.foods.join(", ")}</span>
                  <span className="text-xs text-primary font-medium">{m.progress}%</span>
                </div>
                <button
                  onClick={() => {
                    setEditingMeal(m);
                    setMealSheetOpen(true);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  수정
                </button>
              </div>
            ))}
            {isToday(selectedDate) && (
              <button
                onClick={() => {
                  setEditingMeal(null);
                  setMealSheetOpen(true);
                }}
                className="w-full py-2 text-xs text-primary font-medium"
              >
                + 기록하기
              </button>
            )}
          </div>
        ) : (
          <EmptyState
            label="기록하기"
            onClick={() => {
              setEditingMeal(null);
              setMealSheetOpen(true);
            }}
          />
        )}
      </div>

      {/* 체중 목록 */}
      <div className="rounded-2xl bg-card border border-border/50 p-4">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-foreground">체중</h3>
        </div>
        {weights.length > 0 ? (
          <div className="space-y-2">
            {weights.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(w.measured_at), "HH:mm")}
                  </span>
                  <span className="text-sm font-medium">{Number(w.weight).toFixed(1)} kg</span>
                </div>
                <button
                  onClick={() => {
                    setEditingWeight(w);
                    setWeightSheetOpen(true);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  수정
                </button>
              </div>
            ))}
            {isToday(selectedDate) && (
              <button
                onClick={() => {
                  setEditingWeight(null);
                  setWeightSheetOpen(true);
                }}
                className="w-full py-2 text-xs text-primary font-medium"
              >
                + 기록하기
              </button>
            )}
          </div>
        ) : (
          <EmptyState
            label="기록하기"
            onClick={() => {
              setEditingWeight(null);
              setWeightSheetOpen(true);
            }}
          />
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

      {/* 체중 기록 바텀 시트 */}
      <WeightEditSheet
        open={weightSheetOpen}
        onOpenChange={setWeightSheetOpen}
        initialData={editingWeight || undefined}
        onSaved={fetchWeightData}
      />

      {/* 식단 기록 바텀 시트 */}
      <MealEditSheet
        open={mealSheetOpen}
        onOpenChange={setMealSheetOpen}
        initialData={editingMeal || undefined}
        onSaved={fetchMealData}
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

function CircularScore({
  score,
  maxScore = 5,
  size = 36,
  strokeWidth = 3,
  color,
}: {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  color: "violet" | "orange";
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (score / maxScore) * circumference;
  const offset = circumference - progress;

  const colors = {
    violet: {
      track: "stroke-violet-500/20",
      progress: "stroke-violet-500",
      text: "text-violet-600 dark:text-violet-400",
    },
    orange: {
      track: "stroke-orange-500/20",
      progress: "stroke-orange-500",
      text: "text-orange-600 dark:text-orange-400",
    },
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className={colors[color].track}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
        />
        <circle
          className={colors[color].progress}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${colors[color].text}`}
      >
        {score}
      </span>
    </div>
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
