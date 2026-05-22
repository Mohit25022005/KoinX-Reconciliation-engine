import {
    getValidTransactions,
    findCandidateTransactions,
    markTransactionMatched,
} from "../repositories/transaction.repository";

import {
    createReconciliationResult,
} from "../repositories/reconciliation-result.repository";
import { TransactionSource } from "../constants/transaction";
import { ReconciliationCategory } from "../constants/reconciliation";
import { areQuantitiesWithinTolerance } from "../utils/quantity";
import { isTimestampWithinTolerance } from "../utils/timestamp";
import { calculateMatchScore } from "../utils/match-score";
import { TransactionModel } from "../models/transaction.model";

type ReconcileParams = {
    runId: string;

    timestampToleranceSeconds: number;

    quantityTolerancePct: number;
};

export async function reconcileTransactions(
    params: ReconcileParams
) {
    const userTransactions =
        await getValidTransactions(
            params.runId,
            TransactionSource.USER
        );

    for (const userTx of userTransactions) {
        const startTime = new Date(
            userTx.timestamp.getTime() -
            params.timestampToleranceSeconds *
            1000
        );

        const endTime = new Date(
            userTx.timestamp.getTime() +
            params.timestampToleranceSeconds *
            1000
        );

        const candidates =
            await findCandidateTransactions({
                runId: params.runId,

                source:
                    TransactionSource.EXCHANGE,

                normalizedAsset:
                    userTx.normalizedAsset,

                normalizedType:
                    userTx.normalizedType,

                startTime,

                endTime,
            });

        if (!candidates.length) {
            await createReconciliationResult({
                runId: params.runId,

                userTransactionId:
                    userTx._id.toString(),

                category:
                    ReconciliationCategory.USER_ONLY,

                reason:
                    "No matching exchange transaction found",
            });

            continue;
        }

        let bestCandidate: any = null;

        let bestScore = -1;

        for (const candidate of candidates) {
            const quantityMatches =
                areQuantitiesWithinTolerance(
                    userTx.quantity!.toString(),

                    candidate.quantity!.toString(),

                    params.quantityTolerancePct
                );

            const timestampMatches =
                isTimestampWithinTolerance(
                    userTx.timestamp,

                    candidate.timestamp,

                    params.timestampToleranceSeconds
                );

            if (
                !quantityMatches ||
                !timestampMatches
            ) {
                continue;
            }

            const score = calculateMatchScore({
                quantity1:
                    userTx.quantity!.toString(),

                quantity2:
                    candidate.quantity!.toString(),

                timestamp1: userTx.timestamp,

                timestamp2: candidate.timestamp,
            });

            if (score > bestScore) {
                bestScore = score;

                bestCandidate = candidate;
            }
        }

        if (!bestCandidate) {
            await createReconciliationResult({
                runId: params.runId,

                userTransactionId:
                    userTx._id.toString(),

                category:
                    ReconciliationCategory.CONFLICTING,

                reason:
                    "Candidate transactions found but exceeded tolerance",
            });

            continue;
        }

        await markTransactionMatched(
            userTx._id.toString(),

            bestCandidate._id.toString(),

            bestScore
        );

        await markTransactionMatched(
            bestCandidate._id.toString(),

            userTx._id.toString(),

            bestScore
        );

        await createReconciliationResult({
            runId: params.runId,

            userTransactionId:
                userTx._id.toString(),

            exchangeTransactionId:
                bestCandidate._id.toString(),

            category:
                ReconciliationCategory.MATCHED,

            reason:
                "Matched within configured tolerances",
        });
    }
    // Remaining unmatched exchange transactions

    const unmatchedExchangeTransactions =
        await TransactionModel.find({
            runId: params.runId,

            source: TransactionSource.EXCHANGE,

            isValid: true,

            matched: false,
        });

    for (const exchangeTx of unmatchedExchangeTransactions) {
        await createReconciliationResult({
            runId: params.runId,

            exchangeTransactionId:
                exchangeTx._id.toString(),

            category:
                ReconciliationCategory.EXCHANGE_ONLY,

            reason:
                "No matching user transaction found",
        });
    }
}