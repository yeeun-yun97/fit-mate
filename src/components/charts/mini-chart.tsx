"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import type { DailyLog } from "@/lib/types/database";

interface Props {
  data: DailyLog[];
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
    <div className="rounded-2xl bg-card border border-border/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-foreground">공복 혈액</h2>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            혈당
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-lime-500" />
            케톤
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 10 }}
            domain={["auto", "auto"]}
            width={30}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 10 }}
            domain={[0, "auto"]}
            width={30}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 12,
              border: "1px solid hsl(var(--border))",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="glucose"
            name="혈당"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="ketone"
            name="케톤"
            stroke="#84cc16"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
