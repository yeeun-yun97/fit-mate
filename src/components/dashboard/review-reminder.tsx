"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
import { ReviewEditSheet } from "@/components/sheets/review-edit-sheet";
import { useRouter } from "next/navigation";

interface Props {
  hasYesterdayReview: boolean;
}

export function ReviewReminder({ hasYesterdayReview }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const router = useRouter();

  if (hasYesterdayReview) {
    return null;
  }

  // 어제 날짜 계산
  const yesterday = subDays(new Date(), 1);
  const yesterdayStr = format(yesterday, "yyyy-MM-dd");

  const handleSaved = () => {
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setSheetOpen(true)}
        className="w-full text-left rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-amber-600 dark:text-amber-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              어제 하루 리뷰하기
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              어제의 기록을 돌아보고 리뷰를 남겨보세요
            </p>
          </div>
          <svg
            className="w-5 h-5 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </div>
      </button>

      <ReviewEditSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        date={yesterdayStr}
        onSaved={handleSaved}
      />
    </>
  );
}
