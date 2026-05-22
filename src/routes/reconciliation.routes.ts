import { Router } from "express";

import multer from "multer";

import {
    reconcile,
    getReport,
    getSummary,
    getUnmatched,
    downloadReportCsv,
} from "../controllers/reconciliation.controller";

const router = Router();

const upload = multer({
    dest: "uploads/",
});

router.post(
    "/reconcile",

    upload.fields([
        {
            name: "user_transactions",

            maxCount: 1,
        },

        {
            name: "exchange_transactions",

            maxCount: 1,
        },
    ]),

    reconcile
);

router.get(
    "/report/:runId",
    getReport
);

router.get(
    "/report/:runId/summary",
    getSummary
);

router.get(
    "/report/:runId/unmatched",
    getUnmatched
);

router.get(
    "/report/:runId/csv",
    downloadReportCsv
);

export default router;