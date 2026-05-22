import express from "express";
import cors from "cors";

import { env } from "./config/env";
import { connectDatabase } from "./config/database";

async function bootstrap() {
  await connectDatabase();

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_, res) => {
    res.json({
      success: true,
    });
  });

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

bootstrap();