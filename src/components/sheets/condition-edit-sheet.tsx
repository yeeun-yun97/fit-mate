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
import type { ConditionEntry } from "@/lib/types/database";
import { ConditionPickerSheet } from "./condition-picker-sheet";
import { ChevronRight } from "lucide-react";

const INTENSITY_LABELS = [
  "매우 부정적",
  "부정적",
  "조금 부정적",
  "보통",
  "조금 긍정적",
  "긍정적",
  "매우 긍정적",
];

function intensityLabel(value: number): string {
  return INTENSITY_LABELS[value - 1] || "보통";
}

interface ConditionEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ConditionEntry;
  onSaved?: () => void;
  customPresets?: string[];
  onPresetAdded?: () => void;
}

export function ConditionEditSheet({
  open,
  onOpenChange,
  initialData,
  onSaved,
  customPresets = [],
  onPresetAdded,
}: ConditionEditSheetProps) {
  const [conditionType, setConditionType] = useState("");
  const [intensity, setIntensity] = useState(4);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setConditionType(initialData.condition_type);
        setIntensity(initialData.intensity);
        setNote(initialData.note || "");
      } else {
        setConditionType("");
        setIntensity(4);
        setNote("");
      }
    }
  }, [open, initialData]);

  const handleSave = async () => {
    if (!conditionType.trim()) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      // 기존 emotion 데이터 수정 시 emotion 테이블 사용
      const tableName = initialData?.source === 'emotion'
        ? "timely_emotion_conditions"
        : "timely_body_conditions";

      if (initialData?.id) {
        await supabase
          .from(tableName)
          .update({
            condition_type: conditionType.trim(),
            intensity,
            note: note.trim() || null,
          })
          .eq("id", initialData.id);
      } else {
        // 새 기록은 항상 body 테이블에 저장
        await supabase.from("timely_body_conditions").insert({
          user_id: user.id,
          condition_type: conditionType.trim(),
          intensity,
          logged_at: new Date().toISOString(),
          note: note.trim() || null,
        });

        // 프리셋에 자동 추가
        await supabase.from("user_condition_presets").upsert(
          {
            user_id: user.id,
            category: "body",
            label: conditionType.trim(),
          },
          { onConflict: "user_id,category,label" }
        );
        onPresetAdded?.();
      }

      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save condition:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const tableName = initialData?.source === 'emotion'
        ? "timely_emotion_conditions"
        : "timely_body_conditions";

      await supabase
        .from(tableName)
        .delete()
        .eq("id", initialData.id);

      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete condition:", error);
    } finally {
      setSaving(false);
    }
  };

  const isValid = conditionType.trim().length > 0;

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent>
        <BottomSheetHeader>
          <BottomSheetTitle>
            {initialData ? "컨디션 수정" : "컨디션 기록"}
          </BottomSheetTitle>
        </BottomSheetHeader>

        <BottomSheetBody className="space-y-5">
          {/* 컨디션 타입 선택 */}
          <div className="space-y-2">
            <Label>항목</Label>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm border border-border rounded-lg bg-background hover:bg-muted transition-colors"
            >
              <span className={conditionType ? "text-foreground" : "text-muted-foreground"}>
                {conditionType || "항목 선택"}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* 강도 슬라이더 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>상태</Label>
              <span className="text-xs text-muted-foreground">
                {intensityLabel(intensity)}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              step="1"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none bg-neutral-300/30 accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>부정적</span>
              <span>보통</span>
              <span>긍정적</span>
            </div>
          </div>

          {/* 메모 */}
          <div className="space-y-2">
            <Label htmlFor="note">메모 (선택)</Label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="추가 메모를 입력하세요"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
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
                disabled={saving || !isValid}
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
                disabled={saving || !isValid}
                className="flex-1"
              >
                {saving ? "저장 중..." : "저장"}
              </Button>
            </>
          )}
        </BottomSheetFooter>
      </BottomSheetContent>

      <ConditionPickerSheet
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        presets={customPresets}
        onSelect={(value) => setConditionType(value)}
        onPresetAdded={onPresetAdded}
      />
    </BottomSheet>
  );
}
