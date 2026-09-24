import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { accounts } from './accounts';

export const acknowledgements = pgTable('acknowledgements', {
    id: serial('id').primaryKey(),
    accountId: integer('account_id')
        .references(() => accounts.id, { onDelete: 'cascade' })
        .notNull()
        .unique(),
    // Legacy columns (kept for backward compatibility)
    nameToAcknowledge: text('name_to_acknowledge').notNull().default(''),
    acknowledgementConsent: boolean('acknowledgement_consent').default(false).notNull(),
    // Cardholder acknowledgement
    cardholderName: text('cardholder_name').notNull().default(''),
    cardholderConsent: boolean('cardholder_consent').default(false).notNull(),
    // Account holder acknowledgement
    accountHolderName: text('account_holder_name').notNull().default(''),
    accountHolderConsent: boolean('account_holder_consent').default(false).notNull(),
    consentDate: timestamp('consent_date').defaultNow().notNull(),
});