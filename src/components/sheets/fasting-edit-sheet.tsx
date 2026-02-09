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

interface FastingEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string; // yyyy-MM-dd 형식
  initialData?: {
    fasting_glucose: number | null;
    fasting_ketone: number | null;
  };
  onSaved?: () => void;
}

export function FastingEditSheet({
  open,
  onOpenChange,
  date,
  initialData,
  onSaved,
}: FastingEditSheetProps) {
  const [glucose, setGlucose] = useState(70);
  const [ketone, setKetone] = useState(0);
  const [saving, setSaving] = useState(false);

  // 초기 데이터 설정
  useEffect(() => {
    if (open) {
      setGlucose(initialData?.fasting_glucose ?? 70);
      setKetone(initialData?.fasting_ketone ?? 0);
    }
  }, [open, initialData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();

      // 현재 로그인한 사용자 ID 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const { data: existing } = await supabase
        .from("daily_fastings")
        .select("id")
        .eq("log_date", date)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        await supabase
          .from("daily_fastings")
          .update({
            fasting_glucose: glucose,
            fasting_ketone: ketone,
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("daily_fastings").insert({
          user_id: user.id,
          log_date: date,
          fasting_glucose: glucose,
          fasting_ketone: ketone,
        });
      }

      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save fasting data:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent>
        <BottomSheetHeader>
          <BottomSheetTitle>공복 혈액 수정</BottomSheetTitle>
        </BottomSheetHeader>

        <BottomSheetBody className="space-y-5">
          {/* 혈당 슬라이더 (보라색) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="glucose">공복 혈당 (mg/dL)</Label>
              <span className="text-lg font-extrabold text-violet-500 tabular-nums">
                {glucose}
              </span>
            </div>
            <input
              id="glucose"
              type="range"
              min="70"
              max="135"
              step="1"
              value={glucose}
              onChange={(e) => setGlucose(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-violet-500/20 accent-violet-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>70</span>
              <span>90</span>
              <span>110</span>
              <span>135</span>
            </div>
          </div>

          {/* 케톤 슬라이더 (주황색) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="ketone">공복 케톤 (mmol/L)</Label>
              <span className="text-lg font-extrabold text-orange-500 tabular-nums">
                {ketone.toFixed(1)}
              </span>
            </div>
            <input
              id="ketone"
              type="range"
              min="0"
              max="3.0"
              step="0.1"
              value={ketone}
              onChange={(e) => setKetone(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-orange-500/20 accent-orange-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0.0</span>
              <span>1.0</span>
              <span>2.0</span>
              <span>3.0</span>
            </div>
          </div>
        </BottomSheetBody>

        <BottomSheetFooter>
          <BottomSheetClose asChild>
            <Button variant="outline" className="flex-1">
              취소
            </Button>
          </BottomSheetClose>
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? "저장 중..." : "저장"}
          </Button>
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheet>
  );
}
