import Decimal from "decimal.js";

import { calculateTimestampDifferenceSeconds } from "./timestamp";

export function calculateMatchScore(
  params: {
    quantity1: string;

    quantity2: string;

    timestamp1: Date;

    timestamp2: Date;
  }
): number {
  const quantityDifference =
    new Decimal(params.quantity1)
      .minus(params.quantity2)
      .abs()
      .toNumber();

  const timestampDifference =
    calculateTimestampDifferenceSeconds(
      params.timestamp1,
      params.timestamp2
    );

  let score = 100;

  score -= quantityDifference * 10;

  score -= timestampDifference * 0.1;

  return Math.max(score, 0);
}