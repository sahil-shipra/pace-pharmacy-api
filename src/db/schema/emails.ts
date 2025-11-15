import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";

export const emails = pgTable("email_deliveries", {
    id: serial("id").primaryKey(),
    subject: varchar("subject", { length: 255 }).notNull(),
    messageId: varchar("message_id", { length: 36 }).notNull().unique(),
    status: varchar("status", { length: 50 }).notNull(),
    submittedAt: timestamp("submitted_at").notNull(),
    errorCode: integer("error_code").default(0),
    to: varchar("to_email", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
