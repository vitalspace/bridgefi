// controllers/swap.controller.ts
import { Context } from "elysia";
import { stacksService } from "../services/stacksService";
import { electroneumService } from "../services/electroneumService";
import SwapOrder from "../models/swapOrder.model";

const { getTransactionInfo } = stacksService;

export const createSwapOrder = async (ctx: Context) => {
  try {
    console.log("📥 Request body:", ctx.body);

    const { txId } = ctx.body as {
      txId: string;
    };

    if (!txId) {
      ctx.set.status = 400;
      return {
        success: false,
        message: "txId is required",
      };
    }

    console.log("🔍 Fetching transaction:", txId);
    const result = await getTransactionInfo(txId);

    console.log("📊 Transaction result:", result);

    // Verificar si la transacción existe y fue exitosa
    if (!result || !result.status) {
      // ctx.set.status = 400;
      return {
        success: false,
        message: "Transaction still pending, please try again in a few seconds",
      };
    }

    // Verificar que tengamos todos los datos necesarios
    if (
      !result.orderId ||
      !result.stxAmountFromLog ||
      !result.destinationChain ||
      !result.destinationAddress ||
      !result.destinationToken ||
      !result.expectedAmount
    ) {
      console.error("❌ Incomplete transaction data:", result);
      ctx.set.status = 400;
      return {
        success: false,
        message:
          "Transaction data is incomplete. The contract call may have failed.",
        data: result,
      };
    }

    console.log("🔍 Checking for existing order:", result.orderId);
    const existOrder = await SwapOrder.findOne({ orderId: result.orderId });

    if (existOrder) {
      ctx.set.status = 400;
      return {
        success: false,
        message: "Order already exists",
        order: existOrder,
      };
    }

    console.log("💾 Creating new order...");
    const newOrder = new SwapOrder({
      orderId: result.orderId,
      user: result.sender,
      stxAmount: result.stxAmountFromLog.stx.toString(),
      destinationChain: result.destinationChain,
      destinationAddress: result.destinationAddress,
      destinationToken: result.destinationToken,
      expectedAmount: result.expectedAmount.toString(),
      status: "pending",
      externalTxHash: txId,
    });

    await newOrder.save();
    console.log("✅ Order saved to database");

    if (result.destinationChain.toLowerCase().includes("electroneum")) {
      try {
        console.log("⚡ Executing swap on Electroneum...");
        console.log("Token:", result.destinationToken);
        console.log("Address:", result.destinationAddress);
        console.log("Amount:", result.expectedAmount);

        // Convertir el amount a string con decimales
        let amountInTokens = parseFloat(result.expectedAmount) / 1000000;

        // Aplicar fee del 0.5%
        const fee = amountInTokens * 0.005;
        amountInTokens -= fee;

        console.log(`Original amount: ${parseFloat(result.expectedAmount) / 1000000}, Fee: ${fee}, Final amount: ${amountInTokens}`);

        const etnTxHash = await electroneumService.executeSwap(
          result.destinationToken,
          result.destinationAddress,
          amountInTokens.toString()
        );

        console.log("✅ Electroneum swap successful:", etnTxHash);

        newOrder.status = "completed";
        newOrder.destinationTxHash = etnTxHash;
        await newOrder.save();

        ctx.set.status = 201;
        return {
          success: true,
          order: newOrder,
          message: `Swap completed. ETN TX: ${etnTxHash}`,
        };
      } catch (swapError) {
        console.error("❌ Error in Electroneum swap:", swapError);

        newOrder.status = "failed";
        newOrder.errorMessage = (swapError as Error).message;
        await newOrder.save();

        ctx.set.status = 500;
        return {
          success: false,
          message: "Swap failed in Electroneum",
          error: (swapError as Error).message,
          order: newOrder,
        };
      }
    } else {
      console.error("❌ Unsupported chain:", result.destinationChain);
      newOrder.status = "failed";
      newOrder.errorMessage = `Unsupported chain: ${result.destinationChain}`;
      await newOrder.save();

      ctx.set.status = 400;
      return {
        success: false,
        message: "Destination chain not supported",
        order: newOrder,
      };
    }
  } catch (error) {
    console.error("❌ Fatal error in createSwapOrder:", error);
    console.error("Stack trace:", (error as Error).stack);
    ctx.set.status = 500;
    return {
      success: false,
      message: "internal server error",
      error: (error as Error).message,
    };
  }
};

export const getOrderStatus = async (ctx: Context) => {
  try {
    const { orderId } = ctx.params as { orderId: string };

    const order = await SwapOrder.findOne({ orderId: orderId.toString() });

    if (!order) {
      ctx.set.status = 404;
      return {
        success: false,
        message: "Order not found",
      };
    }

    ctx.set.status = 200;
    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error("Error getting order status:", error);
    ctx.set.status = 500;
    return {
      success: false,
      message: "internal server error",
      error: (error as Error).message,
    };
  }
};

export const pollOrderStatus = async (ctx: Context) => {
  try {
    const { orderId } = ctx.body as { orderId: string | number };

    const order = await SwapOrder.findOne({ orderId });

    if (!order) {
      ctx.set.status = 404;
      return {
        success: false,
        message: "Order not found",
      };
    }

    ctx.set.status = 200;
    return {
      success: true,
      status: order.status,
      order,
    };
  } catch (error) {
    console.error("Error polling order status:", error);
    ctx.set.status = 500;
    return {
      success: false,
      message: "internal server error",
      error: (error as Error).message,
    };
  }
};
