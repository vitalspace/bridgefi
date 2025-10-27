import { Context } from "elysia";
import User from "../models/user.model.js";
import SwapOrder from "../models/swapOrder.model.js";
import { IUser } from "../types/types.js";

export const createUser = async (ctx: Context) => {
  try {
    const { address, avatar, banner, username, email, bio } = ctx.body as IUser;
    const existingUser = await User.findOne({ address });

    if (existingUser) {
      ctx.set.status = 400;
      return { message: "User already exists" };
    }

    const newUser = new User({
      address,
      avatar,
      banner,
      username,
      email,
      bio,
    });

    await newUser.save();

    ctx.set.status = 201;
    return JSON.stringify(newUser);
  } catch (error) {
    ctx.set.status = 500;
    return { message: "internal server error" };
  }
};

export const updateUser = async (ctx: Context) => {
  try {
    const { address, ...updates } = ctx.body as Partial<IUser>;
    const user = await User.findOneAndUpdate({ address }, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      ctx.set.status = 404;
      return { message: "User not found" };
    }

    ctx.set.status = 200;
    return JSON.stringify(user);
  } catch (error) {
    ctx.set.status = 500;
    return { message: "internal server error" };
  }
};

export const profile = async (ctx: Context) => {
  try {
    const { address } = ctx.body as IUser;

    const user = await User.findOne({
      address,
    }).select("-_id -__v -updatedAt");

    if (!user) {
      ctx.set.status = 404;
      return { message: "User not found" };
    }

    ctx.set.status = 200;
    return JSON.stringify(user);
  } catch (error) {
    ctx.set.status = 500;
    return { message: "internal server error" };
  }
};

export const getUserActivity = async (ctx: Context) => {
  try {
    const { address } = ctx.body as { address: string };

    const activities = await SwapOrder.find({ user: address })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("-_id -__v");

    ctx.set.status = 200;
    return JSON.stringify(activities);
  } catch (error) {
    ctx.set.status = 500;
    return { message: "internal server error" };
  }
};

export const getUserStats = async (ctx: Context) => {
  try {
    const { address } = ctx.body as { address: string };

    // Get all swap orders for the user
    const allSwaps = await SwapOrder.find({ user: address });

    // Calculate stats
    const totalSwaps = allSwaps.length;
    const completedSwaps = allSwaps.filter(swap => swap.status === 'completed').length;
    const successRate = totalSwaps > 0 ? Math.round((completedSwaps / totalSwaps) * 100) : 0;

    // Active days - unique dates when user made swaps
    const uniqueDates = new Set(
      allSwaps.map(swap => swap.createdAt.toISOString().split('T')[0])
    );
    const activeDays = uniqueDates.size;

    // Volume - sum of STX amounts for completed swaps
    const volume = allSwaps
      .filter(swap => swap.status === 'completed')
      .reduce((sum, swap) => sum + parseFloat(swap.stxAmount), 0);

    // Top holdings - group by destination token and sum expected amounts
    const tokenHoldings = new Map<string, number>();
    allSwaps
      .filter(swap => swap.status === 'completed')
      .forEach(swap => {
        const current = tokenHoldings.get(swap.destinationToken) || 0;
        tokenHoldings.set(swap.destinationToken, current + parseFloat(swap.expectedAmount));
      });

    const topHoldings = Array.from(tokenHoldings.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([token, amount]) => ({
        token,
        amount: (amount / 1000000).toFixed(6) // Assuming 6 decimals
      }));

    const stats = {
      totalSwaps,
      volume: volume.toFixed(2),
      successRate: `${successRate}%`,
      activeDays,
      topHoldings
    };

    ctx.set.status = 200;
    return JSON.stringify(stats);
  } catch (error) {
    ctx.set.status = 500;
    return { message: "internal server error" };
  }
};
export const getCreditScore = async (ctx: Context) => {
  try {
    const { address } = ctx.body as { address: string };

    if (!address) {
      ctx.set.status = 400;
      return { message: "Address is required" };
    }

    const { creditScoreCalculator } = await import('../services/credit-score-calculator.js');
    const creditScoreData = await creditScoreCalculator.calculateCreditScore(address);

    ctx.set.status = 200;
    return JSON.stringify(creditScoreData);
  } catch (error) {
    console.error('Error getting credit score:', error);
    ctx.set.status = 500;
    return { message: "Internal server error" };
  }
};

