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

import { calculateDailyAverageWeight, WeightData } from "@/lib/utils";

interface Props {
  data: WeightData[];
}

export function WeightBoxplot({ data }: Props) {
  const averagedData = calculateDailyAverageWeight(data);

  if (averagedData.length < 2) {
    return (
      <div className="rounded-2xl bg-card border border-border/50 py-8 text-center text-sm text-muted-foreground">
        차트를 표시하려면 최소 2개의 기록이 필요합니다
      </div>
    );
  }

  // x축 라벨: M/d 형식으로 간단하게 표시
  const chartData = averagedData.map((d) => {
    const [year, month, day] = d.label.split('-');
    return {
      ...d,
      displayLabel: `${parseInt(month)}/${parseInt(day)}`,
    };
  });

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-foreground">체중 추이</h2>
        <span className="text-[10px] text-muted-foreground">단위: kg</span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="displayLabel"
            tick={{ fontSize: 9 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10 }}
            domain={["auto", "auto"]}
            width={30}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 12,
              border: "1px solid hsl(var(--border))",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            labelFormatter={(label) => label}
            formatter={(value) => [`${Number(value).toFixed(1)} kg`, "체중"]}
          />
          <Line
            type="monotone"
            dataKey="weight"
            name="체중"
            stroke="#84cc16"
            strokeWidth={2}
            dot={{ r: 4, fill: "white", stroke: "#84cc16", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
