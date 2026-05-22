export type IngestionIssue = {
    severity: "WARNING" | "ERROR";
    reason: string;
};

export function validateTransactionRow(
    row: Record<string, string>
): IngestionIssue[] {
    const issues: IngestionIssue[] = [];

    // Required field checks

    if (!row.asset) {
        issues.push({
            severity: "ERROR",
            reason: "Missing asset",
        });
    }

    if (!row.type) {
        issues.push({
            severity: "ERROR",
            reason: "Missing type",
        });
    }

    if (!row.quantity) {
        issues.push({
            severity: "ERROR",
            reason: "Missing quantity",
        });
    }

    if (!row.timestamp) {
        issues.push({
            severity: "ERROR",
            reason: "Missing timestamp",
        });
    }

    // Invalid quantity

    if (
        row.quantity &&
        isNaN(Number(row.quantity))
    ) {
        issues.push({
            severity: "ERROR",
            reason: "Invalid quantity",
        });
    }

    // Invalid timestamp

    if (
        row.timestamp &&
        isNaN(Date.parse(row.timestamp))
    ) {
        issues.push({
            severity: "ERROR",
            reason: "Invalid timestamp",
        });
    }

    // Suspicious BUY with negative quantity

    if (
        row.quantity &&
        !isNaN(Number(row.quantity)) &&
        Number(row.quantity) < 0 &&
        row.type?.trim().toUpperCase() ===
        "BUY"
    ) {
        issues.push({
            severity: "WARNING",
            reason:
                "Negative quantity for BUY transaction",
        });
    }

    // Missing price warning

    if (!row.price_usd) {
        issues.push({
            severity: "WARNING",
            reason: "Missing price_usd",
        });
    }

    return issues;
}