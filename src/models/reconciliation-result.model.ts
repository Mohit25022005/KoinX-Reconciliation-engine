import mongoose, {
  Schema,
  Document,
} from "mongoose";

import { ReconciliationCategory } from "../constants/reconciliation";

export interface IReconciliationResult
  extends Document {
  runId: string;

  userTransactionId?: mongoose.Types.ObjectId;

  exchangeTransactionId?: mongoose.Types.ObjectId;

  category: ReconciliationCategory;

  reason: string;
}

const ReconciliationResultSchema =
  new Schema<IReconciliationResult>(
    {
      runId: {
        type: String,
        required: true,
        index: true,
      },

      userTransactionId: {
        type: Schema.Types.ObjectId,
        ref: "Transaction",
      },

      exchangeTransactionId: {
        type: Schema.Types.ObjectId,
        ref: "Transaction",
      },

      category: {
        type: String,
        enum: Object.values(
          ReconciliationCategory
        ),
        required: true,
        index: true,
      },

      reason: {
        type: String,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

export const ReconciliationResultModel =
  mongoose.model<IReconciliationResult>(
    "ReconciliationResult",
    ReconciliationResultSchema
  );