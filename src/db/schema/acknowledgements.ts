import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { accounts } from './accounts';

export const acknowledgements = pgTable('acknowledgements', {
    id: serial('id').primaryKey(),
    accountId: integer('account_id')
        .references(() => accounts.id, { onDelete: 'cascade' })
        .notNull()
        .unique(),
    nameToAcknowledge: text('name_to_acknowledge').notNull(),
    acknowledgementConsent: boolean('acknowledgement_consent').default(false).notNull(),
    consentDate: timestamp('consent_date').defaultNow().notNull(),
});