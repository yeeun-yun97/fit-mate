// 공복 혈당/케톤 평가 유틸리티

export interface Evaluation {
  score: number;
  reason: string;
}

export interface DayEvaluation {
  finalScore: number;
  summary: string;
  details: {
    glucose: Evaluation;
    ketone: Evaluation;
  };
  finalReason: string;
}

// 혈당 평가 함수 (1~5점)
export function evaluateGlucose(g: number): Evaluation {
  if (g < 65) return { score: 1, reason: "저혈당 위험 구간 (공복 혈당이 너무 낮음)" };
  if (g < 70) return { score: 2, reason: "혈당이 다소 낮아 컨디션 저하 가능" };
  if (g <= 85) return { score: 5, reason: "공복 혈당 최적 구간 (인슐린 안정)" };
  if (g <= 90) return { score: 4, reason: "양호한 혈당 상태" };
  if (g <= 100) return { score: 3, reason: "공복 혈당이 다소 높아 조절 여지 있음" };
  if (g <= 110) return { score: 2, reason: "인슐린 반응 증가 가능성" };
  return { score: 1, reason: "공복 혈당 높음 (인슐린 저항 가능)" };
}

// 케톤 평가 함수 (1~5점)
export function evaluateKetone(k: number): Evaluation {
  if (k < 0.3) return { score: 1, reason: "케토시스 거의 없음 (탄수 의존 상태)" };
  if (k < 0.5) return { score: 2, reason: "케토시스 진입 전 단계" };
  if (k < 1.0) return { score: 3, reason: "케토시스 시작 단계" };
  if (k < 1.5) return { score: 4, reason: "안정적인 케토시스 상태" };
  if (k <= 2.0) return { score: 5, reason: "지방 연소 최적 케토시스" };
  if (k <= 3.0) return { score: 4, reason: "케톤이 다소 높음 (전해질/수분 체크 권장)" };
  return { score: 3, reason: "케톤 과도 (컨디션 저하 가능)" };
}

// 최종 통합 평가 함수
export function evaluateDay(g: number, k: number): DayEvaluation {
  const glucose = evaluateGlucose(g);
  const ketone = evaluateKetone(k);
  const finalScore = Math.min(glucose.score, ketone.score);

  const summaryMap: Record<number, string> = {
    5: "완벽한 상태",
    4: "매우 좋은 상태",
    3: "유지 단계",
    2: "조정 필요",
    1: "문제 있음",
  };

  return {
    finalScore,
    summary: summaryMap[finalScore],
    details: { glucose, ketone },
    finalReason: `혈당 평가: ${glucose.reason} / 케톤 평가: ${ketone.reason} → 낮은 점수 기준으로 종합 판단`,
  };
}

// 점수별 색상 클래스
export function getScoreColor(score: number): string {
  switch (score) {
    case 5: return "text-green-500";
    case 4: return "text-lime-500";
    case 3: return "text-yellow-500";
    case 2: return "text-orange-500";
    default: return "text-red-500";
  }
}

// 점수별 배경색 클래스
export function getScoreBgColor(score: number): string {
  switch (score) {
    case 5: return "bg-green-500/10";
    case 4: return "bg-lime-500/10";
    case 3: return "bg-yellow-500/10";
    case 2: return "bg-orange-500/10";
    default: return "bg-red-500/10";
  }
}
