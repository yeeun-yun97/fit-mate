"use client";

import { useState, useMemo } from "react";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetBody,
} from "@/components/ui/bottom-sheet";
import { createClient } from "@/lib/supabase/client";
import { Search, Plus } from "lucide-react";

interface ConditionPickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presets: string[];
  onSelect: (value: string) => void;
  onPresetAdded?: () => void;
}

export function ConditionPickerSheet({
  open,
  onOpenChange,
  presets,
  onSelect,
  onPresetAdded,
}: ConditionPickerSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [adding, setAdding] = useState(false);

  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return presets;
    const query = searchQuery.toLowerCase();
    return presets.filter((preset) => preset.toLowerCase().includes(query));
  }, [presets, searchQuery]);

  const showAddButton = useMemo(() => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    return !presets.some((preset) => preset.toLowerCase() === query);
  }, [presets, searchQuery]);

  const handleSelect = (value: string) => {
    onSelect(value);
    setSearchQuery("");
    onOpenChange(false);
  };

  const handleAddNew = async () => {
    const newValue = searchQuery.trim();
    if (!newValue) return;

    setAdding(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      await supabase.from("user_condition_presets").upsert(
        {
          user_id: user.id,
          category: "body",
          label: newValue,
        },
        { onConflict: "user_id,category,label" }
      );

      onPresetAdded?.();
      handleSelect(newValue);
    } catch (error) {
      console.error("Failed to add preset:", error);
    } finally {
      setAdding(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearchQuery("");
    }
    onOpenChange(open);
  };

  return (
    <BottomSheet open={open} onOpenChange={handleOpenChange}>
      <BottomSheetContent>
        <BottomSheetHeader>
          <BottomSheetTitle>항목 선택</BottomSheetTitle>
        </BottomSheetHeader>

        <BottomSheetBody className="space-y-4">
          {/* 검색 입력 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="항목 검색 또는 새로 추가"
              className="w-full pl-10 pr-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* 프리셋 리스트 */}
          <div className="max-h-60 overflow-y-auto -mx-1">
            {filteredPresets.length > 0 ? (
              <div className="space-y-1">
                {filteredPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelect(preset)}
                    className="w-full px-4 py-3 text-left text-sm rounded-lg hover:bg-muted transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {searchQuery.trim()
                  ? "검색 결과가 없습니다"
                  : "등록된 항목이 없습니다"}
              </div>
            )}
          </div>

          {/* 새 항목 추가 버튼 */}
          {showAddButton && (
            <button
              type="button"
              onClick={handleAddNew}
              disabled={adding}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-primary border border-dashed border-primary rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>"{searchQuery.trim()}" 추가</span>
            </button>
          )}
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  );
}
