import { Elysia, t } from "elysia";
import {
  createSwapOrder,
  getOrderStatus,
  pollOrderStatus,
} from "../controllers/swap.controller";

export const swapRoutes = new Elysia({
  detail: {
    tags: ["Swap"],
  },
})
  .post("/create-order", createSwapOrder, {
    body: t.Object({
      txId: t.String({
        minLength: 64,
        description: "Stacks transaction ID"
      }),
    }),
    detail: {
      summary: "Create a new swap order",
      description: "Creates a swap order from a Stacks transaction and executes it on Electroneum"
    }
  })
  .get("/order/:orderId", getOrderStatus, {
    params: t.Object({
      orderId: t.String({
        description: "Order ID to query"
      }),
    }),
    detail: {
      summary: "Get order status",
      description: "Retrieves the status of a specific swap order"
    }
  })
  .post("/poll-order", pollOrderStatus, {
    body: t.Object({
      orderId: t.Union([t.Number(), t.String()]),
    }),
    detail: {
      summary: "Poll order status",
      description: "Polls the current status of a swap order"
    }
  });
