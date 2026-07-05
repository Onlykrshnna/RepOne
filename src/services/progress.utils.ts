export function calculateBMI(weightKg?: number | null, heightCm?: number | null): number | null {
  if (!weightKg || !heightCm || heightCm === 0) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Number(bmi.toFixed(2));
}

export function calculateTrend(current?: number | null, previous?: number | null): { value: number, isPositive: boolean, formatted: string } | null {
  if (!current || !previous || previous === 0) return null;
  
  const diff = current - previous;
  const isPositive = diff > 0;
  
  return {
    value: diff,
    isPositive,
    formatted: `${isPositive ? '+' : ''}${diff.toFixed(1)}`
  };
}

export function formatMeasurement(value?: number | null, unit: string = 'cm') {
  if (value === undefined || value === null) return '--';
  return `${value} ${unit}`;
}
