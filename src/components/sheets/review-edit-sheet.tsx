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
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

interface ReviewEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string; // yyyy-MM-dd 형식
  initialData?: {
    rating: number;
    good_points: string | null;
    bad_points: string | null;
  };
  onSaved?: () => void;
}

export function ReviewEditSheet({
  open,
  onOpenChange,
  date,
  initialData,
  onSaved,
}: ReviewEditSheetProps) {
  const [rating, setRating] = useState(3);
  const [goodPoints, setGoodPoints] = useState("");
  const [badPoints, setBadPoints] = useState("");
  const [saving, setSaving] = useState(false);

  // 초기 데이터 설정
  useEffect(() => {
    if (open) {
      setRating(initialData?.rating ?? 3);
      setGoodPoints(initialData?.good_points ?? "");
      setBadPoints(initialData?.bad_points ?? "");
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
        .from("daily_reviews")
        .select("id")
        .eq("review_date", date)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        await supabase
          .from("daily_reviews")
          .update({
            rating,
            good_points: goodPoints || null,
            bad_points: badPoints || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("daily_reviews").insert({
          user_id: user.id,
          review_date: date,
          rating,
          good_points: goodPoints || null,
          bad_points: badPoints || null,
        });
      }

      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save review:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <BottomSheetContent>
        <BottomSheetHeader>
          <BottomSheetTitle>
            {format(parseISO(date), "M월 d일", { locale: ko })} 리뷰
          </BottomSheetTitle>
        </BottomSheetHeader>

        <BottomSheetBody className="space-y-5">
          {/* 별점 선택 */}
          <div className="space-y-2">
            <Label>점수</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <svg
                    className="w-8 h-8"
                    viewBox="0 0 24 24"
                    fill={star <= rating ? "#facc15" : "#d1d5db"}
                    stroke="none"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                    />
                  </svg>
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating}/5
              </span>
            </div>
          </div>

          {/* 잘한 점 */}
          <div className="space-y-2">
            <Label htmlFor="good-points">잘한 점</Label>
            <Textarea
              id="good-points"
              placeholder="잘한 점을 적어보세요"
              value={goodPoints}
              onChange={(e) => setGoodPoints(e.target.value)}
              rows={3}
            />
          </div>

          {/* 못한 점 */}
          <div className="space-y-2">
            <Label htmlFor="bad-points">아쉬운 점</Label>
            <Textarea
              id="bad-points"
              placeholder="아쉬웠던 점을 적어보세요"
              value={badPoints}
              onChange={(e) => setBadPoints(e.target.value)}
              rows={3}
            />
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
