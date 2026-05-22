const TYPE_MAPPING: Record<
    string,
    string
> = {
    BUY: "BUY",

    SELL: "SELL",

    TRANSFER_IN: "TRANSFER",

    TRANSFER_OUT: "TRANSFER",

    DEPOSIT: "TRANSFER",

    WITHDRAWAL: "TRANSFER",
};

export function normalizeType(
    type: string
): string {
    const normalized = type
        .trim()
        .toUpperCase();

    return (
        TYPE_MAPPING[normalized] ||
        normalized
    );
}