"use client";

import { useState } from "react";

interface DayData {
  date: string;
  weights: number[];
}

interface Props {
  data: DayData[];
}

function calculateBoxPlotStats(values: number[]) {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;

  const q1Idx = Math.floor(sorted.length / 4);
  const q3Idx = Math.floor((sorted.length * 3) / 4);
  const q1 = sorted[q1Idx];
  const q3 = sorted[q3Idx];

  return { min, max, median, q1, q3 };
}

export function WeightBoxplot({ data }: Props) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: any } | null>(null);

  // 데이터가 있는 날만 필터링
  const daysWithData = data.filter((d) => d.weights.length > 0);

  const chartData = data.map((d, i) => {
    if (d.weights.length === 0) {
      return { date: d.date, min: undefined, max: undefined, median: undefined, q1: undefined, q3: undefined, lastWeight: undefined, isUp: false };
    }
    const stats = calculateBoxPlotStats(d.weights);
    const lastWeight = d.weights[d.weights.length - 1]; // 가장 늦은 시간의 체중

    // 이전에 데이터가 있는 날 찾기
    let prevLastWeight: number | null = null;
    for (let j = i - 1; j >= 0; j--) {
      if (data[j].weights.length > 0) {
        prevLastWeight = data[j].weights[data[j].weights.length - 1];
        break;
      }
    }

    // 이전 일 대비 증가면 빨강, 아니면 파랑
    const isUp = prevLastWeight !== null && lastWeight > prevLastWeight;

    return { date: d.date, ...stats, lastWeight, isUp };
  });

  // 모든 체중값에서 min/max 계산하여 Y축 범위 결정
  const allWeights = data.flatMap((d) => d.weights);
  const dataMin = allWeights.length > 0 ? Math.min(...allWeights) : 50;
  const dataMax = allWeights.length > 0 ? Math.max(...allWeights) : 65;
  const padding = (dataMax - dataMin) * 0.2 || 5; // 최소 5kg 패딩
  const minY = Math.floor((dataMin - padding) / 5) * 5; // 5단위로 내림
  const maxY = Math.ceil((dataMax + padding) / 5) * 5; // 5단위로 올림
  const chartHeight = 140;
  const chartWidth = 280;
  const paddingLeft = 35;
  const paddingRight = 10;
  const paddingTop = 10;
  const barWidth = 20;

  const yScale = (value: number) => {
    return paddingTop + chartHeight - ((value - minY) / (maxY - minY)) * chartHeight;
  };

  const xScale = (index: number) => {
    const availableWidth = chartWidth - paddingLeft - paddingRight;
    const step = availableWidth / (chartData.length);
    return paddingLeft + step * index + step / 2;
  };

  // Y축 눈금 동적 생성 (2.5kg 간격)
  const yTicks: number[] = [];
  for (let tick = minY; tick <= maxY; tick += 2.5) {
    yTicks.push(tick);
  }

  const COLOR_UP = "#ef4444"; // 빨강 (증가)
  const COLOR_DOWN = "#3b82f6"; // 파랑 (감소/유지)

  // 데이터가 없는 경우
  if (daysWithData.length === 0) {
    return (
      <div className="rounded-2xl bg-card border border-border/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">체중</h2>
          <span className="text-[10px] text-muted-foreground">단위: kg</span>
        </div>
        <div className="flex flex-col items-center justify-center h-[140px] text-muted-foreground">
          <p className="text-sm">아직 기록된 체중이 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-foreground">체중</h2>
        <span className="text-[10px] text-muted-foreground">단위: kg</span>
      </div>
      <div className="relative">
        <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight + paddingTop + 25}`} className="overflow-visible">
          {/* Grid lines */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={paddingLeft}
                y1={yScale(tick)}
                x2={chartWidth - paddingRight}
                y2={yScale(tick)}
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
              />
              <text
                x={paddingLeft - 5}
                y={yScale(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-muted-foreground"
                fontSize={9}
              >
                {tick}
              </text>
            </g>
          ))}

          {/* X axis labels */}
          {chartData.map((d, i) => (
            <text
              key={d.date}
              x={xScale(i)}
              y={chartHeight + paddingTop + 15}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={9}
            >
              {d.date}
            </text>
          ))}

          {/* Box plots */}
          {chartData.map((d, i) => {
            if (!d.min || !d.max || !d.q1 || !d.q3 || !d.median) return null;

            const x = xScale(i);
            const minPx = yScale(d.min);
            const maxPx = yScale(d.max);
            const q1Px = yScale(d.q1);
            const q3Px = yScale(d.q3);

            const color = d.isUp ? COLOR_UP : COLOR_DOWN;

            return (
              <g
                key={d.date}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({ x: rect.left + rect.width / 2, y: rect.top, data: d });
                }}
                onMouseLeave={() => setTooltip(null)}
                className="cursor-pointer"
              >
                {/* 위 수염 */}
                <line
                  x1={x}
                  y1={maxPx}
                  x2={x}
                  y2={q3Px}
                  stroke={color}
                  strokeWidth={1}
                />
                {/* 박스 */}
                <rect
                  x={x - barWidth / 2}
                  y={q3Px}
                  width={barWidth}
                  height={q1Px - q3Px}
                  fill={color}
                />
                {/* 아래 수염 */}
                <line
                  x1={x}
                  y1={q1Px}
                  x2={x}
                  y2={minPx}
                  stroke={color}
                  strokeWidth={1}
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute bg-background border border-border rounded-lg px-3 py-2 shadow-lg text-xs pointer-events-none z-10"
            style={{
              left: '50%',
              top: 0,
              transform: 'translateX(-50%)'
            }}
          >
            <p className="font-medium mb-1">{tooltip.data.date}</p>
            <p className="text-muted-foreground">최대: <span className="text-foreground font-medium">{tooltip.data.max.toFixed(1)} kg</span></p>
            <p className="text-muted-foreground">최소: <span className="text-foreground font-medium">{tooltip.data.min.toFixed(1)} kg</span></p>
          </div>
        )}
      </div>
    </div>
  );
}
