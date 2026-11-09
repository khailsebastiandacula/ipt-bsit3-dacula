import mysql from "mysql2/promise";
import { requireEnv, requireEnvAllowEmpty, requireEnvOptional } from "./env.js";

const DATABASE_URL = requireEnvOptional("DATABASE_URL");

type DbConnectionOptions =
  | string
  | {
      host: string;
      port: number;
      user: string;
      password: string;
      database?: string;
    };

function getDatabaseName() {
  if (DATABASE_URL) {
    const url = new URL(DATABASE_URL);
    return url.pathname.replace(/^\//, "");
  }

  return requireEnvOptional("DB_NAME") ?? requireEnv("MYSQLDATABASE");
}

function createConnectionOptions(): DbConnectionOptions {
  if (DATABASE_URL) {
    return DATABASE_URL;
  }

  const host = process.env.DB_HOST?.trim() || requireEnv("MYSQLHOST");
  const port = Number(process.env.DB_PORT?.trim() || requireEnv("MYSQLPORT"));
  const user = process.env.DB_USER?.trim() || requireEnv("MYSQLUSER");
  const password =
    process.env.DB_PASSWORD !== undefined
      ? process.env.DB_PASSWORD
      : requireEnvAllowEmpty("MYSQLPASSWORD");
  const database = process.env.DB_NAME?.trim() || requireEnv("MYSQLDATABASE");

  return {
    host,
    port,
    user,
    password,
  };
}

const connectionOptions = createConnectionOptions();
export const dbName = getDatabaseName();

const pool = mysql.createPool({
  ...(typeof connectionOptions === "string"
    ? { uri: connectionOptions }
    : { ...connectionOptions, database: dbName }),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
});

export const dbConfig = connectionOptions;

export default pool;
