import express from "express";

import cors from "cors";

import fs from "fs";

import { env } from "./config/env";

import { connectDatabase } from "./config/database";

import reconciliationRoutes from "./routes/reconciliation.routes";

async function bootstrap() {
    await connectDatabase();

    const app = express();

    // Ensure uploads directory exists

    if (!fs.existsSync("uploads")) {
        fs.mkdirSync("uploads");
    }

    app.use(cors());

    app.use(express.json());

    app.get("/health", (_, res) => {
        res.json({
            success: true,
        });
    });

    app.use("/", reconciliationRoutes);

    app.listen(env.port, () => {
        console.log(
            `Server running on port ${env.port}`
        );
    });
}

bootstrap();