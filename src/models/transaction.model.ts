import mongoose, {
  Schema,
  Document,
} from "mongoose";

import { TransactionSource } from "../constants/transaction";

export interface IIngestionIssue {
  severity: "WARNING" | "ERROR";
  reason: string;
}

export interface ITransaction extends Document {
  runId: string;

  source: TransactionSource;

  transactionId?: string;

  asset: string;
  normalizedAsset: string;

  type: string;
  normalizedType: string;

  quantity?: mongoose.Types.Decimal128;

  priceUsd?: mongoose.Types.Decimal128;

  fee?: mongoose.Types.Decimal128;

  timestamp: Date;

  rawData: Record<string, any>;

  ingestionIssues: IIngestionIssue[];

  isValid: boolean;

  matched: boolean;

  matchedTransactionId?: mongoose.Types.ObjectId;

  matchConfidence?: number;
}

const TransactionSchema =
  new Schema<ITransaction>(
    {
      runId: {
        type: String,
        required: true,
        index: true,
      },

      source: {
        type: String,
        enum: Object.values(
          TransactionSource
        ),
        required: true,
        index: true,
      },

      transactionId: {
        type: String,
      },

      asset: {
        type: String,
      },

      normalizedAsset: {
        type: String,
        index: true,
      },

      type: {
        type: String,
      },

      normalizedType: {
        type: String,
        index: true,
      },

      quantity: {
        type: Schema.Types.Decimal128,
      },

      priceUsd: {
        type: Schema.Types.Decimal128,
      },

      fee: {
        type: Schema.Types.Decimal128,
      },

      timestamp: {
        type: Date,
        index: true,
      },

      rawData: {
        type: Schema.Types.Mixed,
        required: true,
      },

      ingestionIssues: [
        {
          severity: {
            type: String,
            enum: ["WARNING", "ERROR"],
            required: true,
          },

          reason: {
            type: String,
            required: true,
          },
        },
      ],

      isValid: {
        type: Boolean,
        default: true,
      },

      matched: {
        type: Boolean,
        default: false,
      },

      matchedTransactionId: {
        type: Schema.Types.ObjectId,
        ref: "Transaction",
      },

      matchConfidence: {
        type: Number,
      },
    },
    {
      timestamps: true,
    }
  );

TransactionSchema.index({
  normalizedAsset: 1,
  normalizedType: 1,
  timestamp: 1,
});

export const TransactionModel =
  mongoose.model<ITransaction>(
    "Transaction",
    TransactionSchema
  );