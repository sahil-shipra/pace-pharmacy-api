import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Create a drizzle client
const drizzleClient = drizzle(
    postgres(connectionString, {
        connect_timeout: 30,
    }),
    { schema }
);

// Tell TypeScript about the global var
declare global {
    // eslint-disable-next-line no-var
    var __db__: PostgresJsDatabase<typeof schema> | undefined;
}

// Reuse the connection in development (hot reload safe)
export const db =
    process.env.NODE_ENV === "production"
        ? drizzleClient
        : global.__db__ || (global.__db__ = drizzleClient);
