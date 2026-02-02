"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserConditionPreset } from "@/lib/types/database";

interface PresetItemProps {
  preset: UserConditionPreset;
  onDelete: (id: string) => void;
  deleting: boolean;
}

function PresetItem({ preset, onDelete, deleting }: PresetItemProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
      <span className="text-sm">{preset.label}</span>
      <button
        onClick={() => onDelete(preset.id)}
        disabled={deleting}
        className="text-xs text-red-500 hover:text-red-600 disabled:opacity-50"
      >
        삭제
      </button>
    </div>
  );
}

export function ConditionPresetsSettings() {
  const [presets, setPresets] = useState<UserConditionPreset[]>([]);
  const [deleting, setDeleting] = useState(false);

  const fetchPresets = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("user_condition_presets")
      .select("id, category, label")
      .order("created_at", { ascending: true });

    if (data) {
      setPresets(data);
    }
  }, []);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const supabase = createClient();
      await supabase.from("user_condition_presets").delete().eq("id", id);
      await fetchPresets();
    } catch (error) {
      console.error("Failed to delete preset:", error);
    } finally {
      setDeleting(false);
    }
  };

  const hasPresets = presets.length > 0;

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-4">
      <h3 className="text-sm font-bold text-foreground mb-3">컨디션 프리셋 관리</h3>

      {!hasPresets ? (
        <p className="text-sm text-muted-foreground">
          저장된 사용자 정의 프리셋이 없습니다.
        </p>
      ) : (
        <div className="space-y-1">
          {presets.map((preset) => (
            <PresetItem
              key={preset.id}
              preset={preset}
              onDelete={handleDelete}
              deleting={deleting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
