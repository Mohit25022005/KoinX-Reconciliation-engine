import { Request, Response } from "express";

import { v4 as uuidv4 } from "uuid";

import { env } from "../config/env";

import { parseCsv } from "../services/csv.service";

import { ingestTransactions } from "../services/transaction-ingestion.service";

import { reconcileTransactions } from "../services/reconciliation.service";

import { TransactionSource } from "../constants/transaction";

import { ReconciliationRunModel } from "../models/reconciliation-run.model";
import { generateCsvReport } from "../services/report-export.service";
import {
    getReportByRunId,
    getSummaryByRunId,
    getUnmatchedByRunId,
} from "../repositories/reconciliation-result.repository";

export async function reconcile(
    req: Request,
    res: Response
) {
    try {
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        const userFile =
            files?.["user_transactions"]?.[0];

        const exchangeFile =
            files?.["exchange_transactions"]?.[0];

        if (!userFile || !exchangeFile) {
            return res.status(400).json({
                success: false,

                message:
                    "Both CSV files are required",
            });
        }

        const runId = uuidv4();

        const timestampToleranceSeconds =
            Number(
                String(
                    req.body
                        .timestampToleranceSeconds ||
                    env.timestampToleranceSeconds
                )
            );

        const quantityTolerancePct =
            Number(
                String(
                    req.body
                        .quantityTolerancePct ||
                    env.quantityTolerancePct
                )
            );

        await ReconciliationRunModel.create({
            runId,

            config: {
                timestampToleranceSeconds,

                quantityTolerancePct,
            },

            status: "PROCESSING",
        });

        const userRows = await parseCsv(
            userFile.path
        );

        const exchangeRows =
            await parseCsv(
                exchangeFile.path
            );

        await ingestTransactions({
            rows: userRows,

            source: TransactionSource.USER,

            runId,
        });

        await ingestTransactions({
            rows: exchangeRows,

            source:
                TransactionSource.EXCHANGE,

            runId,
        });

        await reconcileTransactions({
            runId,

            timestampToleranceSeconds,

            quantityTolerancePct,
        });

        const summary =
            await getSummaryByRunId(runId);

        const formattedSummary = {
            matched: 0,

            conflicting: 0,

            userOnly: 0,

            exchangeOnly: 0,
        };

        for (const item of summary) {
            if (item._id === "MATCHED") {
                formattedSummary.matched =
                    item.count;
            }

            if (
                item._id === "CONFLICTING"
            ) {
                formattedSummary.conflicting =
                    item.count;
            }

            if (
                item._id === "USER_ONLY"
            ) {
                formattedSummary.userOnly =
                    item.count;
            }

            if (
                item._id === "EXCHANGE_ONLY"
            ) {
                formattedSummary.exchangeOnly =
                    item.count;
            }
        }

        await ReconciliationRunModel.updateOne(
            { runId },
            {
                status: "COMPLETED",

                summary: formattedSummary,
            }
        );

        return res.json({
            success: true,

            runId,

            summary: formattedSummary,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,

            message:
                "Failed to reconcile transactions",
        });
    }
}

export async function getReport(
    req: Request,
    res: Response
) {
    try {
        const report =
            await getReportByRunId(
                String(req.params.runId)
            );

        return res.json({
            success: true,

            data: report,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,

            message:
                "Failed to fetch report",
        });
    }
}

export async function getSummary(
    req: Request,
    res: Response
) {
    try {
        const run =
            await ReconciliationRunModel.findOne(
                {
                    runId: String(req.params.runId),
                }
            );

        return res.json({
            success: true,

            data: run?.summary || {},
        });
    } catch (error) {
        return res.status(500).json({
            success: false,

            message:
                "Failed to fetch summary",
        });
    }
}

export async function getUnmatched(
    req: Request,
    res: Response
) {
    try {
        const unmatched =
            await getUnmatchedByRunId(
                String(req.params.runId)
            );

        return res.json({
            success: true,

            data: unmatched,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,

            message:
                "Failed to fetch unmatched transactions",
        });
    }
}

export async function downloadReportCsv(
  req: Request,
  res: Response
) {
  try {
    const runId = String(
      req.params.runId
    );

    const filePath =
      await generateCsvReport(runId);

    return res.download(filePath);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,

      message:
        "Failed to generate CSV report",
    });
  }
}