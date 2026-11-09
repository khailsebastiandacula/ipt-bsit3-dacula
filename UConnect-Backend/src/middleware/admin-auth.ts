import type { MiddlewareHandler } from "hono";
import { requireEnv } from "../config/env.js";

const ADMIN_KEY = requireEnv("ADMIN_KEY");

export const requireAdminAuth: MiddlewareHandler = async (context, next) => {
  const providedKey = context.req.header("x-admin-key");

  if (!providedKey || providedKey !== ADMIN_KEY) {
    return context.json({ message: "Unauthorized admin request" }, 401);
  }

  await next();
};
