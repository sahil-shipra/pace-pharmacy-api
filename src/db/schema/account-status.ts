import { boolean, integer, pgTable, serial, timestamp } from 'drizzle-orm/pg-core';
import { accounts } from './accounts';

export const accountStatusTable = pgTable('account_status', {
    id: serial('id').primaryKey(),
    accountId: integer('account_id')
        .references(() => accounts.id, { onDelete: 'cascade' })
        .notNull()
        .unique(),
    isActive: boolean('is_active').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});