import { describe, it, expect } from 'vitest';
import { calculatePercentage, calculateClassesNeeded, calculateSafeBunks } from './calculations.js';

describe('Attendance Calculations', () => {
  it('calculates correct percentage', () => {
    expect(calculatePercentage(80, 100)).toBe(80);
    expect(calculatePercentage(3, 4)).toBe(75);
    expect(calculatePercentage(1, 3)).toBeCloseTo(33.33);
  });

  it('handles zero total classes', () => {
    expect(calculatePercentage(0, 0)).toBe(0);
    expect(calculateClassesNeeded(0, 0, 75)).toBe(0);
  });

  it('calculates required classes to reach target', () => {
    // 60 attended, 100 total, 75% target => Needs 60 consecutive future classes
    // (60+x)/(100+x) = 0.75 => 60+x = 75 + 0.75x => 0.25x = 15 => x = 60
    expect(calculateClassesNeeded(60, 100, 75)).toBe(60);
    
    // Already above target => Needs 0
    expect(calculateClassesNeeded(80, 100, 75)).toBe(0);
  });

  it('handles 100% target correctly', () => {
    // If target is 100%, and we are below, we can never mathematically reach 100%
    // but the logic returns -1 to indicate "All future classes"
    expect(calculateClassesNeeded(80, 100, 100)).toBe(-1);
  });

  it('calculates maximum bunkable classes', () => {
    // 80 attended, 100 total, 75% target
    // 80 / (100 + y) = 0.75 => 80 = 75 + 0.75y => 0.75y = 5 => y = 6.66 => 6
    expect(calculateSafeBunks(80, 100, 75)).toBe(6);

    // Below target => Bunkable is 0
    expect(calculateSafeBunks(60, 100, 75)).toBe(0);
  });
  
  it('handles invalid calculator inputs gracefully', () => {
    // These should not crash and ideally return logical defaults
    expect(calculatePercentage(110, 100)).toBe(110); // Calculation logic itself just does division
  });
});
