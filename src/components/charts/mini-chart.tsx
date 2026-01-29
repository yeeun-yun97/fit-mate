"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
} from "recharts";
import { format } from "date-fns";
import type { DailyFasting } from "@/lib/types/database";

interface Props {
  data: DailyFasting[];
}

export function MiniChart({ data }: Props) {
  const [showGlucose, setShowGlucose] = useState(true);
  const [showKetone, setShowKetone] = useState(true);

  if (data.length < 2) {
    return (
      <div className="rounded-2xl bg-card border border-border/50 py-8 text-center text-sm text-muted-foreground">
        차트를 표시하려면 최소 2개의 기록이 필요합니다
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: format(new Date(d.log_date + "T00:00:00"), "M/d"),
    glucose: d.fasting_glucose,
    ketone: d.fasting_ketone,
  }));

  // 하나만 선택됐을 때 음영 표시
  const showGlucoseShading = showGlucose && !showKetone;
  const showKetoneShading = showKetone && !showGlucose;

  const toggleGlucose = () => {
    if (showGlucose && !showKetone) return; // 최소 하나는 선택
    setShowGlucose(!showGlucose);
  };

  const toggleKetone = () => {
    if (showKetone && !showGlucose) return; // 최소 하나는 선택
    setShowKetone(!showKetone);
  };

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-foreground">공복 혈액</h2>
        <div className="flex items-center gap-1 text-[10px]">
          <button
            onClick={toggleGlucose}
            className={`px-2 py-1 rounded-md border transition-colors ${
              showGlucose
                ? "bg-violet-500 text-white border-violet-500"
                : "bg-transparent text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            혈당
          </button>
          <button
            onClick={toggleKetone}
            className={`px-2 py-1 rounded-md border transition-colors ${
              showKetone
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-transparent text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            케톤
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          {showGlucose && (
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10 }}
              domain={[60, 110]}
              width={30}
            />
          )}
          {showKetone && (
            <YAxis
              yAxisId="right"
              orientation={showGlucose ? "right" : "left"}
              tick={{ fontSize: 10 }}
              domain={[0, 3]}
              width={30}
            />
          )}
          {/* 목표 구간 음영 (하나만 선택됐을 때 표시) */}
          {showGlucoseShading && (
            <ReferenceArea
              yAxisId="left"
              y1={70}
              y2={90}
              fill="#8b5cf6"
              fillOpacity={0.15}
            />
          )}
          {showKetoneShading && (
            <ReferenceArea
              yAxisId="right"
              y1={1.0}
              y2={2.0}
              fill="#f97316"
              fillOpacity={0.15}
            />
          )}
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 12,
              border: "1px solid hsl(var(--border))",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          />
          {showGlucose && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="glucose"
              name="혈당"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          )}
          {showKetone && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ketone"
              name="케톤"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
