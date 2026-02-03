"use client";

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

  return (
    <div className="space-y-4">
      {/* 혈당 차트 */}
      <div className="rounded-2xl bg-card border border-border/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">공복 혈당</h2>
          <span className="text-[10px] text-muted-foreground">단위: mg/dL</span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis
              tick={{ fontSize: 10 }}
              domain={[60, 110]}
              width={30}
            />
            <ReferenceArea
              y1={70}
              y2={90}
              fill="#8b5cf6"
              fillOpacity={0.15}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(value) => [`${value} mg/dL`, "혈당"]}
            />
            <Line
              type="monotone"
              dataKey="glucose"
              name="혈당"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 4, fill: "white", stroke: "#8b5cf6", strokeWidth: 2 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 케톤 차트 */}
      <div className="rounded-2xl bg-card border border-border/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">공복 케톤</h2>
          <span className="text-[10px] text-muted-foreground">단위: mmol/L</span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis
              tick={{ fontSize: 10 }}
              domain={[0, 3]}
              width={30}
            />
            <ReferenceArea
              y1={1.0}
              y2={2.0}
              fill="#f97316"
              fillOpacity={0.15}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(value) => [`${value} mmol/L`, "케톤"]}
            />
            <Line
              type="monotone"
              dataKey="ketone"
              name="케톤"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ r: 4, fill: "white", stroke: "#f97316", strokeWidth: 2 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
