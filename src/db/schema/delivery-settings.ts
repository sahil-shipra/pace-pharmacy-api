import { pgTable, serial, text, integer, jsonb } from 'drizzle-orm/pg-core';
import { accounts } from './accounts';

export const deliverySettings = pgTable('delivery_settings', {
    id: serial('id').primaryKey(),
    accountId: integer('account_id')
        .references(() => accounts.id, { onDelete: 'cascade' })
        .notNull()
        .unique(),
    instruction: text('instruction'),
    // Store delivery hours as JSON for flexibility
    deliveryHours: jsonb('delivery_hours').$type<{
        Monday?: string;
        Tuesday?: string;
        Wednesday?: string;
        Thursday?: string;
        Friday?: string;
        Saturday?: string;
        Sunday?: string;
    }>(),
});