import { pgTable, uuid, integer, text, timestamp } from "drizzle-orm/pg-core";

export const documentsTable = pgTable("documents", {
    id: uuid("id").primaryKey(),
    referenceCode: text("reference_code"),
    path: text("path").notNull(),
    fullPath: text("full_path").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
