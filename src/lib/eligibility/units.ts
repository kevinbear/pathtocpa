import type { UnitType } from "./types";

/**
 * Convert a course's units to semester units.
 *
 * California uses semester units; quarter units convert at quarter × 2/3.
 * We compute as (units * 2) / 3 rather than units * (2/3) to keep common cases
 * exact in floating point — e.g. 36 quarter units → exactly 24 semester units.
 */
export function toSemesterUnits(units: number, unitType: UnitType): number {
  return unitType === "quarter" ? (units * 2) / 3 : units;
}

/** Round to 2 decimal places to tame floating-point noise in sums and comparisons. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
