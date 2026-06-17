export function calculatePercentage(attended, total) {
  if (total === 0) return 0;
  return Number(((attended / total) * 100).toFixed(2));
}

export function calculateSafeBunks(attended, total, minPercentage) {
  const minRatio = minPercentage / 100;
  if (minRatio === 0) return Infinity; 
  
  const currentPercentage = calculatePercentage(attended, total);
  if (currentPercentage < minPercentage) return 0;
  
  const maxTotalAllowed = Math.floor(attended / minRatio);
  const safeBunks = maxTotalAllowed - total;
  
  return safeBunks > 0 ? safeBunks : 0;
}

export function calculateClassesNeeded(attended, total, minPercentage) {
  const currentPercentage = calculatePercentage(attended, total);
  if (currentPercentage >= minPercentage) return 0;
  
  const minRatio = minPercentage / 100;
  if (minRatio === 1) return -1;
  
  const needed = Math.ceil((minRatio * total - attended) / (1 - minRatio));
  return needed > 0 ? needed : 0;
}

export function getStatusText(percentage, minPercentage) {
  if (percentage >= minPercentage + 5) return 'SAFE';
  if (percentage >= minPercentage) return 'WARNING';
  return 'CRITICAL';
}

export function getEmoji(percentage) {
  if (percentage >= 95) return '🏆';
  if (percentage >= 85) return '😎';
  if (percentage >= 75) return '🙂';
  if (percentage >= 60) return '⚠️';
  return '🚨';
}

export function getLocalDateString(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
