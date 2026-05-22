import mongoose, { Schema, Document } from "mongoose";

export interface IReconciliationRun extends Document {
  runId: string;

  config: {
    timestampToleranceSeconds: number;
    quantityTolerancePct: number;
  };

  status: "PROCESSING" | "COMPLETED" | "FAILED";

  summary: {
    matched: number;
    conflicting: number;
    userOnly: number;
    exchangeOnly: number;
  };
}

const ReconciliationRunSchema = new Schema<IReconciliationRun>(
  {
    runId: {
      type: String,
      required: true,
      unique: true,
    },

    config: {
      timestampToleranceSeconds: Number,
      quantityTolerancePct: Number,
    },

    status: {
      type: String,
      enum: ["PROCESSING", "COMPLETED", "FAILED"],
      default: "PROCESSING",
    },

    summary: {
      matched: {
        type: Number,
        default: 0,
      },

      conflicting: {
        type: Number,
        default: 0,
      },

      userOnly: {
        type: Number,
        default: 0,
      },

      exchangeOnly: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const ReconciliationRunModel =
  mongoose.model<IReconciliationRun>(
    "ReconciliationRun",
    ReconciliationRunSchema
  );