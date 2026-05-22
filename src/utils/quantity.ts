import Decimal from "decimal.js";

export function areQuantitiesWithinTolerance(
  quantity1: string,
  quantity2: string,
  tolerancePct: number
): boolean {
  const q1 = new Decimal(quantity1);

  const q2 = new Decimal(quantity2);

  const difference = q1.minus(q2).abs();

  const allowedDifference =
    q1.mul(tolerancePct).div(100);

  return difference.lte(
    allowedDifference
  );
}