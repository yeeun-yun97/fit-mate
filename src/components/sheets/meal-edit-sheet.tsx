"use client";

import { useState, useEffect } from "react";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetBody,
  BottomSheetFooter,
  BottomSheetClose,
} from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

interface MealEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    id: string;
    foods: string[];
    eaten_at: string;
    progress: number;
  };
  onSaved?: () => void;
}

export function MealEditSheet({
  open,
  onOpenChange,
  initialData,
  onSaved,
}: MealEditSheetProps) {
  const [foods, setFoods] = useState<string[]>([]);
  const [newFood, setNewFood] = useState("");
  const [progress, setProgress] = useState(100);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setFoods(initialData?.foods || []);
      setProgress(initialData?.progress ?? 100);
      setNewFood("");
    }
  }, [open, initialData]);

  const handleAddFood = () => {
    const trimmed = newFood.trim();
    if (trimmed && !foods.includes(trimmed)) {
      setFoods([...foods, trimmed]);
      setNewFood("");
    }
  };

  const handleRemoveFood = (index: number) => {
    setFoods(foods.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleAddFood();
    }
  };

  const handleSave = async () => {
    if (foods.length === 0) return;

    setSaving(true);
    try {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      if (initialData?.id) {
        await supabase
          .from("timely_meals")
          .update({ foods, progress })
          .eq("id", initialData.id);
      } else {
        await supabase.from("timely_meals").insert({
          user_id: user.id,
          foods,
          progress,
          eaten_at: new Date().toISOString(),
        });
      }

      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save meal data:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;

    setSaving(true);
    try {
      const supabase = createClient();
      await supabase
        .from("timely_meals")
        .delete()
        .eq("id", initialData.id);

      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete meal data:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent>
        <BottomSheetHeader>
          <BottomSheetTitle>
            {initialData ? "식단 수정" : "식단 기록"}
          </BottomSheetTitle>
        </BottomSheetHeader>

        <BottomSheetBody className="space-y-4">
          {/* 음식 입력 */}
          <div className="flex gap-2">
            <Input
              value={newFood}
              onChange={(e) => setNewFood(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="음식 이름 입력"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddFood}
              disabled={!newFood.trim()}
            >
              추가
            </Button>
          </div>

          {/* 음식 목록 */}
          {foods.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {foods.map((food, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-sm"
                >
                  {food}
                  <button
                    type="button"
                    onClick={() => handleRemoveFood(index)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {foods.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              먹은 음식을 추가해주세요
            </p>
          )}

          {/* 진행률 슬라이더 */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">완식률</span>
              <span className="text-lg font-bold text-primary tabular-nums">
                {progress}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-muted accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </BottomSheetBody>

        <BottomSheetFooter>
          {initialData ? (
            <>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={saving}
                className="flex-1"
              >
                삭제
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || foods.length === 0}
                className="flex-1"
              >
                {saving ? "저장 중..." : "저장"}
              </Button>
            </>
          ) : (
            <>
              <BottomSheetClose asChild>
                <Button variant="outline" className="flex-1">
                  취소
                </Button>
              </BottomSheetClose>
              <Button
                onClick={handleSave}
                disabled={saving || foods.length === 0}
                className="flex-1"
              >
                {saving ? "저장 중..." : "저장"}
              </Button>
            </>
          )}
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}
