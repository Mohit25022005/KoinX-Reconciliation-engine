import mongoose from "mongoose";

import { TransactionModel } from "../models/transaction.model";

import { normalizeAsset } from "../utils/asset-normalizer";

import { normalizeType } from "../utils/type-normalizer";

import { validateTransactionRow } from "./transaction-validation.service";

import { TransactionSource } from "../constants/transaction";

function toDecimal(value?: string) {
    if (!value) {
        return null;
    }

    if (isNaN(Number(value))) {
        return null;
    }

    return mongoose.Types.Decimal128.fromString(
        value
    );
}

export async function ingestTransactions(
    params: {
        rows: Record<string, string>[];

        source: TransactionSource;

        runId: string;
    }
) {
    const documents = params.rows.map(
        (row) => {
            const issues =
                validateTransactionRow(row);

            return {
                runId: params.runId,

                source: params.source,

                transactionId:
                    row.transaction_id,

                asset: row.asset,

                normalizedAsset: row.asset
                    ? normalizeAsset(row.asset)
                    : "",

                type: row.type,

                normalizedType: row.type
                    ? normalizeType(row.type)
                    : "",

                quantity: toDecimal(
                    row.quantity
                ),

                priceUsd: toDecimal(
                    row.price_usd
                ),

                fee: toDecimal(row.fee),

                timestamp: row.timestamp
                    ? new Date(row.timestamp)
                    : null,

                rawData: row,

                ingestionIssues: issues,

                isValid: !issues.some(
                    (issue) =>
                        issue.severity === "ERROR"
                ),

                matched: false,
            };
        }
    );

    await TransactionModel.insertMany(
        documents
    );
}