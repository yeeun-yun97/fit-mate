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
import { ReviewEditSheet } from "@/components/sheets/review-edit-sheet";
import { ConditionEditSheet } from "@/components/sheets/condition-edit-sheet";
import type { DailyFasting, DailyReview, ConditionEntry } from "@/lib/types/database";

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

export function TodayContent() {
  const [fastingData, setFastingData] = useState<DailyFasting | null>(null);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [review, setReview] = useState<DailyReview | null>(null);
  const [conditions, setConditions] = useState<ConditionEntry[]>([]);
  const [conditionPresets, setConditionPresets] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [fastingSheetOpen, setFastingSheetOpen] = useState(false);
  const [weightSheetOpen, setWeightSheetOpen] = useState(false);
  const [mealSheetOpen, setMealSheetOpen] = useState(false);
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false);
  const [conditionSheetOpen, setConditionSheetOpen] = useState(false);
  const [editingWeight, setEditingWeight] = useState<WeightEntry | null>(null);
  const [editingMeal, setEditingMeal] = useState<MealEntry | null>(null);
  const [editingCondition, setEditingCondition] = useState<ConditionEntry | null>(null);

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

  // 리뷰 데이터 가져오기
  const fetchReviewData = useCallback(async () => {
    const supabase = createClient();
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    const { data } = await supabase
      .from("daily_reviews")
      .select("*")
      .eq("review_date", dateStr)
      .single();

    setReview(data);
  }, [selectedDate]);

  // 컨디션 데이터 가져오기 (신체 + 감정 통합)
  const fetchConditions = useCallback(async () => {
    const supabase = createClient();
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const nextDateStr = format(addDays(selectedDate, 1), "yyyy-MM-dd");

    const [bodyRes, emotionRes] = await Promise.all([
      supabase
        .from("timely_body_conditions")
        .select("id, condition_type, intensity, logged_at, note")
        .gte("logged_at", dateStr)
        .lt("logged_at", nextDateStr),
      supabase
        .from("timely_emotion_conditions")
        .select("id, condition_type, intensity, logged_at, note")
        .gte("logged_at", dateStr)
        .lt("logged_at", nextDateStr),
    ]);

    const merged: ConditionEntry[] = [
      ...(bodyRes.data || []).map((d) => ({ ...d, source: 'body' as const })),
      ...(emotionRes.data || []).map((d) => ({ ...d, source: 'emotion' as const })),
    ].sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());

    setConditions(merged);
  }, [selectedDate]);

  // 사용자 정의 프리셋 가져오기
  const fetchConditionPresets = useCallback(async () => {
    const supabase = createClient();

    const { data } = await supabase
      .from("user_condition_presets")
      .select("id, category, label")
      .order("created_at", { ascending: true });

    if (data) {
      // 모든 카테고리의 프리셋을 하나의 목록으로 통합
      const allLabels = data.map((p) => p.label);
      // 중복 제거
      setConditionPresets([...new Set(allLabels)]);
    }
  }, []);

  // 리뷰 작성 가능 여부 (오늘 이전 날짜만 가능)
  const canWriteReview = !isToday(selectedDate);

  // 날짜가 변경될 때마다 데이터 가져오기
  useEffect(() => {
    fetchFastingData();
    fetchWeightData();
    fetchMealData();
    fetchReviewData();
    fetchConditions();
  }, [fetchFastingData, fetchWeightData, fetchMealData, fetchReviewData, fetchConditions]);

  // 프리셋은 한 번만 가져오기
  useEffect(() => {
    fetchConditionPresets();
  }, [fetchConditionPresets]);

  const canGoNext = !isToday(selectedDate);
  const minDate = new Date(2026, 0, 26); // 2026년 1월 26일
  const canGoPrev = selectedDate > minDate;

  const goToPrevDay = () => {
    if (canGoPrev) {
      setSelectedDate(subDays(selectedDate, 1));
    }
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
            disabled={!canGoPrev}
            className={`p-1.5 rounded-full transition-colors ${
              canGoPrev ? "hover:bg-muted" : "opacity-30 cursor-not-allowed"
            }`}
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

      {/* 하루 리뷰 - 데이터 있을 때만 표시 */}
      {review && (
        <div className="rounded-2xl bg-card border border-border/50 p-4">
          <h3 className="text-sm font-bold text-foreground mb-3">하루 리뷰</h3>
          <div className="flex items-start gap-4">
            {/* 별점 */}
            <div className="flex items-center gap-1">
              <StarIcon className="w-7 h-7" filled />
              <span className="text-lg font-bold text-foreground">
                {review.rating}
              </span>
            </div>
            {/* 잘한 점 + 아쉬운 점 세로 배열 */}
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">잘한 점</p>
                <p className="text-sm whitespace-pre-line">{review.good_points || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">아쉬운 점</p>
                <p className="text-sm whitespace-pre-line">{review.bad_points || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
        ) : isToday(selectedDate) ? (
          <EmptyState
            label="기록하기"
            onClick={() => setFastingSheetOpen(true)}
          />
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">기록 없음</p>
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
        ) : isToday(selectedDate) ? (
          <EmptyState
            label="기록하기"
            onClick={() => {
              setEditingMeal(null);
              setMealSheetOpen(true);
            }}
          />
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">기록 없음</p>
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
        ) : isToday(selectedDate) ? (
          <EmptyState
            label="기록하기"
            onClick={() => {
              setEditingWeight(null);
              setWeightSheetOpen(true);
            }}
          />
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">기록 없음</p>
        )}
      </div>

      {/* 컨디션 (통합) */}
      <div className="rounded-2xl bg-card border border-border/50 p-4">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-foreground">컨디션</h3>
        </div>
        {conditions.length > 0 ? (
          <div className="space-y-2">
            {conditions.map((c) => (
              <div
                key={`${c.source}-${c.id}`}
                className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(c.logged_at), "HH:mm")}
                  </span>
                  <span className="text-sm font-medium">{c.condition_type}</span>
                  {c.intensity !== 4 && (
                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          c.intensity < 4 ? "bg-red-400" : "bg-green-400"
                        }`}
                        style={{
                          width: `${c.intensity < 4
                            ? ((4 - c.intensity) / 3) * 100
                            : ((c.intensity - 4) / 3) * 100}%`
                        }}
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setEditingCondition(c);
                    setConditionSheetOpen(true);
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
                  setEditingCondition(null);
                  setConditionSheetOpen(true);
                }}
                className="w-full py-2 text-xs text-primary font-medium"
              >
                + 기록하기
              </button>
            )}
          </div>
        ) : isToday(selectedDate) ? (
          <EmptyState
            label="기록하기"
            onClick={() => {
              setEditingCondition(null);
              setConditionSheetOpen(true);
            }}
          />
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">기록 없음</p>
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

      {/* 하루 리뷰 바텀 시트 */}
      <ReviewEditSheet
        open={reviewSheetOpen}
        onOpenChange={setReviewSheetOpen}
        date={format(selectedDate, "yyyy-MM-dd")}
        initialData={
          review
            ? {
                rating: review.rating,
                good_points: review.good_points,
                bad_points: review.bad_points,
              }
            : undefined
        }
        onSaved={fetchReviewData}
      />

      {/* 컨디션 바텀 시트 */}
      <ConditionEditSheet
        open={conditionSheetOpen}
        onOpenChange={setConditionSheetOpen}
        initialData={editingCondition || undefined}
        onSaved={fetchConditions}
        customPresets={conditionPresets}
        onPresetAdded={fetchConditionPresets}
      />
    </div>
  );
}

function StarIcon({ className, filled }: { className?: string; filled: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "#facc15" : "#d1d5db"}
      stroke="none"
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
