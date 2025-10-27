// controllers/price.controller.ts
import { Context } from "elysia";
import { priceService } from "../services/priceService";

export const getPrices = async (ctx: Context) => {
  try {
    const prices = await priceService.getAllPrices();
    
    ctx.set.status = 200;
    return {
      success: true,
      prices,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error getting prices:', error);
    ctx.set.status = 500;
    return {
      success: false,
      message: 'Failed to fetch prices',
      error: (error as Error).message
    };
  }
};

export const getQuote = async (ctx: Context) => {
  try {
    const { fromToken, toToken, amount } = ctx.body as {
      fromToken: string;
      toToken: string;
      amount: number;
    };

    if (!fromToken || !toToken || !amount) {
      ctx.set.status = 400;
      return {
        success: false,
        message: 'Missing required parameters: fromToken, toToken, amount'
      };
    }

    const prices = await priceService.getAllPrices();
    const expectedAmount = await priceService.calculateSwapAmount(
      fromToken,
      toToken,
      amount
    );
    
    const rate = await priceService.getExchangeRate(fromToken, toToken);

    ctx.set.status = 200;
    return {
      success: true,
      quote: {
        fromToken,
        toToken,
        amount,
        expectedAmount,
        rate,
        fromTokenPrice: prices[fromToken],
        toTokenPrice: prices[toToken],
        timestamp: Date.now()
      }
    };
  } catch (error) {
    console.error('Error getting quote:', error);
    ctx.set.status = 500;
    return {
      success: false,
      message: 'Failed to get quote',
      error: (error as Error).message
    };
  }
};
