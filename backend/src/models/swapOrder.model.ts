// models/swapOrder.model.ts
import { Schema, model } from "mongoose";

const swapOrderSchema = new Schema({
  orderId: { type: String, required: true, unique: true },
  user: { type: String, required: true },
  stxAmount: { type: String, required: true },
  destinationChain: { type: String, required: true },
  destinationAddress: { type: String, required: true },
  destinationToken: { type: String, required: true },
  expectedAmount: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending"
  },
  externalTxHash: { type: String, required: true }, // TX de Stacks
  destinationTxHash: { type: String }, // TX de Electroneum
  errorMessage: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SwapOrder = model("SwapOrder", swapOrderSchema);
export default SwapOrder;
