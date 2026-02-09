import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface WeightData {
  label: string;
  weight: number;
  measured_at: string;
}

export function calculateDailyAverageWeight(data: WeightData[]) {
  const dailyWeights: { [key: string]: { totalWeight: number; count: number } } = {};

  data.forEach(item => {
    // Convert to KST
    const date = new Date(item.measured_at);
    const offset = date.getTimezoneOffset() * 60 * 1000; // offset in milliseconds
    const kstOffset = 9 * 60 * 60 * 1000; // KST is UTC+9
    const kstDate = new Date(date.getTime() + offset + kstOffset);

    const year = kstDate.getFullYear();
    const month = (kstDate.getMonth() + 1).toString().padStart(2, '0');
    const day = kstDate.getDate().toString().padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    if (!dailyWeights[dateString]) {
      dailyWeights[dateString] = { totalWeight: 0, count: 0 };
    }
    dailyWeights[dateString].totalWeight += item.weight;
    dailyWeights[dateString].count += 1;
  });

  const averageWeights = Object.keys(dailyWeights).map(dateString => {
    const { totalWeight, count } = dailyWeights[dateString];
    return {
      label: dateString,
      weight: totalWeight / count,
      measured_at: dateString,
    };
  });

  return averageWeights.sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime());
}
