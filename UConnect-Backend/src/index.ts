import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { bootstrapDatabase } from "./db/bootstrap.js";
import adminRoute from "./routes/admin.route.js";
import {
  requireEnv,
  requireEnvNumber,
  requireEnvOptional,
} from "./config/env.js";
import publicRoute from "./routes/public.route.js";

const app = new Hono();
const PORT = requireEnvNumber("PORT");
const FRONTEND_ORIGIN = requireEnvOptional("FRONTEND_ORIGIN");
const PUBLIC_BASE_URL =
  requireEnvOptional("RENDER_EXTERNAL_URL") ??
  requireEnvOptional("PUBLIC_BASE_URL") ??
  `http://localhost:${PORT}`;

app.use(
  "*",
  cors({
    origin: FRONTEND_ORIGIN ?? "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "x-admin-key"],
    maxAge: 600,
    credentials: Boolean(FRONTEND_ORIGIN),
  }),
);

app.get("/", (context) =>
  context.json({ service: "UConnect API", status: "ok" }, 200),
);
app.get("/api/health", (context) => context.json({ status: "healthy" }, 200));

app.route("/api", publicRoute);
app.route("/api/admin", adminRoute);

async function startServer() {
  await bootstrapDatabase();

  serve(
    {
      fetch: app.fetch,
      port: PORT,
    },
    (info) => {
      console.log(
        `UConnect API running at ${PUBLIC_BASE_URL} (port ${info.port})`,
      );
    },
  );
}

startServer().catch((error) => {
  console.error("Failed to start API:", error);
  process.exit(1);
});
