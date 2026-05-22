import fs from "fs";

import path from "path";

import { format } from "@fast-csv/format";

import { ReconciliationResultModel } from "../models/reconciliation-result.model";

export async function generateCsvReport(
    runId: string
): Promise<string> {
    const results =
        await ReconciliationResultModel.find({
            runId,
        })
            .populate("userTransactionId")
            .populate("exchangeTransactionId");

    const reportsDir = path.join(
        process.cwd(),
        "reports"
    );

    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir);
    }

    const filePath = path.join(
        reportsDir,
        `${runId}.csv`
    );

    const ws =
        fs.createWriteStream(filePath);

    const csvStream = format({
        headers: true,
    });

    csvStream.pipe(ws);

    for (const result of results) {
        const userTx: any =
            result.userTransactionId;

        const exchangeTx: any =
            result.exchangeTransactionId;

        csvStream.write({
            category: result.category,

            reason: result.reason,

            user_transaction_id:
                userTx?.transactionId || "",

            user_asset:
                userTx?.asset || "",

            user_type:
                userTx?.type || "",

            user_quantity:
                userTx?.quantity?.toString() ||
                "",

            user_timestamp:
                userTx?.timestamp?.toISOString?.() ||
                "",

            exchange_transaction_id:
                exchangeTx?.transactionId ||
                "",

            exchange_asset:
                exchangeTx?.asset || "",

            exchange_type:
                exchangeTx?.type || "",

            exchange_quantity:
                exchangeTx?.quantity?.toString() ||
                "",

            exchange_timestamp:
                exchangeTx?.timestamp?.toISOString?.() ||
                "",
        });
    }

    csvStream.end();

    return new Promise((resolve) => {
        ws.on("finish", () => {
            resolve(filePath);
        });
    });
}