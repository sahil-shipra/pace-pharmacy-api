import { pgTable, serial, varchar, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { accounts } from "./accounts";

export const statusTypeEnum = pgEnum('status', ['complete', 'pending']);

export const krollStatus = pgTable("kroll_status", {
    id: serial("id").primaryKey(),
    accountId: integer('account_id')
        .references(() => accounts.id, { onDelete: 'cascade' })
        .notNull(),
    status: statusTypeEnum('address_type').default('pending'),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
