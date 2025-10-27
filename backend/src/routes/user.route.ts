import { Elysia, t } from "elysia";
import {
  createUser,
  profile,
  updateUser,
  getUserActivity,
  getUserStats,
  getCreditScore,
} from "../controllers/user.controller";

export const userRoutes = new Elysia({
  detail: {
    tags: ["User"],
    
  },
})
  .post("/create-user", createUser, {
    body: t.Object({
      address: t.String({
        minLength: 40,
      }),
      avatar: t.Optional(t.String()),
      banner: t.Optional(t.String()),
      username: t.Optional(t.String({ minLength: 1, maxLength: 50 })),
      email: t.Optional(t.String({ format: 'email' })),
      bio: t.Optional(t.String({ maxLength: 160 })),
    }),
  })
  .post("/profile", profile, {
    body: t.Object({
      address: t.String(),
    }),
  })
  .put("/update-user", updateUser, {
    body: t.Object({
      address: t.String(),
      username: t.Optional(t.String({ minLength: 1, maxLength: 50 })),
      email: t.Optional(t.String({ format: 'email' })),
      avatar: t.Optional(t.String({})),
      banner: t.Optional(t.String({})),
      bio: t.Optional(t.String({ maxLength: 160 })),
    }),
  })
  .post("/activity", getUserActivity, {
    body: t.Object({
      address: t.String(),
    }),
  })
  .post("/stats", getUserStats, {
    body: t.Object({
      address: t.String(),
    }),
  })
  .post("/credit-score", getCreditScore, {
    body: t.Object({
      address: t.String(),
    }),
  })
