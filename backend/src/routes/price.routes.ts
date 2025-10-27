import { Elysia, t } from "elysia";
import { getPrices, getQuote } from "../controllers/price.controller";

export const priceRoutes = new Elysia({
  detail: {
    tags: ["Prices"],
  },
})
  .get("/prices", getPrices, {
    detail: {
      summary: "Get all token prices",
      description: "Retrieves current prices for all supported tokens from CoinGecko"
    }
  })
  .post("/prices/quote", getQuote, {
    body: t.Object({
      fromToken: t.String({
        description: "Source token symbol (e.g., STX)"
      }),
      toToken: t.String({
        description: "Destination token symbol (e.g., sUSDC, sETH)"
      }),
      amount: t.Number({ 
        minimum: 0,
        description: "Amount to swap"
      }),
    }),
    detail: {
      summary: "Get swap quote",
      description: "Calculates expected amount for a token swap based on current prices"
    }
  });
