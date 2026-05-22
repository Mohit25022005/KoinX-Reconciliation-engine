import { ReconciliationResultModel } from "../models/reconciliation-result.model";

import { ReconciliationCategory } from "../constants/reconciliation";

export async function createReconciliationResult(
  params: {
    runId: string;

    userTransactionId?: string;

    exchangeTransactionId?: string;

    category: ReconciliationCategory;

    reason: string;
  }
) {
  return ReconciliationResultModel.create({
    runId: params.runId,

    userTransactionId:
      params.userTransactionId,

    exchangeTransactionId:
      params.exchangeTransactionId,

    category: params.category,

    reason: params.reason,
  });
}

export async function getReportByRunId(
  runId: string
) {
  return ReconciliationResultModel.find({
    runId,
  })
    .populate("userTransactionId")
    .populate("exchangeTransactionId");
}

export async function getSummaryByRunId(
  runId: string
) {
  return ReconciliationResultModel.aggregate([
    {
      $match: {
        runId,
      },
    },

    {
      $group: {
        _id: "$category",

        count: {
          $sum: 1,
        },
      },
    },
  ]);
}

export async function getUnmatchedByRunId(
  runId: string
) {
  return ReconciliationResultModel.find({
    runId,

    category: {
      $in: [
        ReconciliationCategory.USER_ONLY,

        ReconciliationCategory.EXCHANGE_ONLY,
      ],
    },
  })
    .populate("userTransactionId")
    .populate("exchangeTransactionId");
}