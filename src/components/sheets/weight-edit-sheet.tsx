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
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

interface WeightEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    id: string;
    weight: number;
    measured_at: string;
  };
  onSaved?: () => void;
}

export function WeightEditSheet({
  open,
  onOpenChange,
  initialData,
  onSaved,
}: WeightEditSheetProps) {
  const [weight, setWeight] = useState(50);
  const [saving, setSaving] = useState(false);

  // 초기 데이터 설정
  useEffect(() => {
    if (open) {
      setWeight(initialData ? Number(initialData.weight) : 50);
    }
  }, [open, initialData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      if (initialData?.id) {
        // 수정 (체중만 업데이트, 시간은 유지)
        await supabase
          .from("timely_weights")
          .update({ weight })
          .eq("id", initialData.id);
      } else {
        // 새로 추가 (현재 시간으로 저장)
        await supabase.from("timely_weights").insert({
          user_id: user.id,
          weight,
          measured_at: new Date().toISOString(),
        });
      }

      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save weight data:", error);
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
        .from("timely_weights")
        .delete()
        .eq("id", initialData.id);

      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete weight data:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent>
        <BottomSheetHeader>
          <BottomSheetTitle>
            {initialData ? "체중 수정" : "체중 기록"}
          </BottomSheetTitle>
        </BottomSheetHeader>

        <BottomSheetBody className="space-y-5">
          {/* 체중 슬라이더 (파란색) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="weight">체중 (kg)</Label>
              <span className="text-lg font-extrabold text-neutral-500 tabular-nums">
                {weight.toFixed(1)}
              </span>
            </div>
            <input
              id="weight"
              type="range"
              min="50"
              max="60"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-neutral-300/30 accent-neutral-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>50</span>
              <span>52.5</span>
              <span>55</span>
              <span>57.5</span>
              <span>60</span>
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
              <Button onClick={handleSave} disabled={saving} className="flex-1">
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
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? "저장 중..." : "저장"}
              </Button>
            </>
          )}
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  );
}
