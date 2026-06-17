export function calculatePercentage(attended: number, total: number): number {
  if (total === 0) return 0;
  return Number(((attended / total) * 100).toFixed(2));
}

export function calculateSafeBunks(attended: number, total: number, minPercentage: number): number {
  // We want to find x such that: attended / (total + x) >= minPercentage / 100
  // attended >= (total + x) * (minPercentage / 100)
  // attended / (minPercentage / 100) >= total + x
  // x <= (attended / (minPercentage / 100)) - total
  
  const minRatio = minPercentage / 100;
  if (minRatio === 0) return Infinity; // can bunk forever if min is 0
  
  const currentPercentage = calculatePercentage(attended, total);
  if (currentPercentage < minPercentage) return 0;
  
  const maxTotalAllowed = Math.floor(attended / minRatio);
  const safeBunks = maxTotalAllowed - total;
  
  return safeBunks > 0 ? safeBunks : 0;
}

export function calculateClassesNeeded(attended: number, total: number, minPercentage: number): number {
  // We want to find x such that: (attended + x) / (total + x) >= minPercentage / 100
  // Let m = minPercentage / 100
  // attended + x >= m * (total + x)
  // attended + x >= m * total + m * x
  // x - m * x >= m * total - attended
  // x * (1 - m) >= m * total - attended
  // x >= (m * total - attended) / (1 - m)
  
  const currentPercentage = calculatePercentage(attended, total);
  if (currentPercentage >= minPercentage) return 0;
  
  const minRatio = minPercentage / 100;
  if (minRatio === 1) {
      // If 100% attendance is required and they missed a class, it's impossible.
      return -1; // Indicate impossible
  }
  
  const needed = Math.ceil((minRatio * total - attended) / (1 - minRatio));
  return needed > 0 ? needed : 0;
}

export function getStatusText(percentage: number, minPercentage: number): string {
  if (percentage >= minPercentage + 5) return 'SAFE';
  if (percentage >= minPercentage) return 'WARNING';
  return 'CRITICAL';
}

export function getEmoji(percentage: number): string {
  if (percentage >= 95) return '🏆';
  if (percentage >= 85) return '😎';
  if (percentage >= 75) return '🙂';
  if (percentage >= 60) return '⚠️';
  return '🚨';
}
