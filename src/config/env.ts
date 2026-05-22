import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 3000),

  mongoUri:
    process.env.MONGO_URI ||
    "mongodb://localhost:27017/koinx-reconciliation",

  timestampToleranceSeconds: Number(
    process.env.TIMESTAMP_TOLERANCE_SECONDS || 300
  ),

  quantityTolerancePct: Number(
    process.env.QUANTITY_TOLERANCE_PCT || 0.01
  ),
};