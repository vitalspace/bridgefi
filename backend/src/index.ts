import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import connectDB from "./db/db";
import { userRoutes } from "./routes/user.route";
import { swapRoutes } from "./routes/swap.route";
import { priceRoutes } from "./routes/price.routes";
// import { aiRoutes } from "./routes/ai.routes";
// import { imageRoutes } from "./routes/image.route";

const PORT = process.env.PORT || 4000;
const ORIGIN = process.env.ORIGIN || "http://localhost:5173";

(async () => await connectDB())();

const app = new Elysia()
  .use(
    cors({
      origin: ORIGIN,
      allowedHeaders: ["Content-Type"],
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  )
  .group("/api/v1", (app) =>
    app.use(userRoutes).use(swapRoutes).use(priceRoutes)
  )
  .listen(PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
