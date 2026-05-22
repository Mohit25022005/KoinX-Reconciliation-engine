import { TransactionModel } from "../models/transaction.model";

import { TransactionSource } from "../constants/transaction";

export async function getValidTransactions(
  runId: string,
  source: TransactionSource
) {
  return TransactionModel.find({
    runId,
    source,
    isValid: true,
  }).sort({
    timestamp: 1,
  });
}

export async function findCandidateTransactions(
  params: {
    runId: string;

    source: TransactionSource;

    normalizedAsset: string;

    normalizedType: string;

    startTime: Date;

    endTime: Date;
  }
) {
  return TransactionModel.find({
    runId: params.runId,

    source: params.source,

    isValid: true,

    matched: false,

    normalizedAsset:
      params.normalizedAsset,

    normalizedType:
      params.normalizedType,

    timestamp: {
      $gte: params.startTime,
      $lte: params.endTime,
    },
  });
}

export async function markTransactionMatched(
  transactionId: string,
  matchedTransactionId: string,
  confidence: number
) {
  await TransactionModel.findByIdAndUpdate(
    transactionId,
    {
      matched: true,

      matchedTransactionId,

      matchConfidence: confidence,
    }
  );
}