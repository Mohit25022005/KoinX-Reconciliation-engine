const ASSET_ALIASES: Record<
    string,
    string
> = {
    BTC: "BITCOIN",

    BITCOIN: "BITCOIN",

    ETH: "ETHEREUM",

    ETHEREUM: "ETHEREUM",

    USDT: "TETHER",

    TETHER: "TETHER",

    SOL: "SOLANA",

    SOLANA: "SOLANA",
};

export function normalizeAsset(
    asset: string
): string {
    const normalized = asset
        .trim()
        .toUpperCase();

    return (
        ASSET_ALIASES[normalized] ||
        normalized
    );
}