export function isTimestampWithinTolerance(
  date1: Date,
  date2: Date,
  toleranceSeconds: number
): boolean {
  const differenceMs = Math.abs(
    date1.getTime() - date2.getTime()
  );

  return (
    differenceMs <=
    toleranceSeconds * 1000
  );
}

export function calculateTimestampDifferenceSeconds(
  date1: Date,
  date2: Date
): number {
  return (
    Math.abs(
      date1.getTime() - date2.getTime()
    ) / 1000
  );
}