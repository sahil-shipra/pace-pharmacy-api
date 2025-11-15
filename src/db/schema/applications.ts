import { pgTable, serial, integer, boolean, timestamp, varchar, pgEnum } from 'drizzle-orm/pg-core';
import { accounts } from './accounts';
import { sql } from 'drizzle-orm';

export const prescriptionEnum = pgEnum('prescription_requirement', [
    'withPrescription',
    'withoutPrescription',
]);

export const applications = pgTable('applications', {
    id: serial('id').primaryKey(),
    accountId: integer('account_id')
        .references(() => accounts.id, { onDelete: 'cascade' })
        .notNull()
        .unique(),
    referenceCode: varchar('reference_code', { length: 28 })
        .notNull()
        .unique(),
    // Expiry date - 14 days from creation
    expiryDate: timestamp('expiry_date', { withTimezone: true })
        .notNull()
        .default(sql`NOW() + INTERVAL '14 days'`),
    // Account status
    isActive: boolean('is_active').notNull().default(true),
    isExpired: boolean('is_expired').notNull().default(false),
    isSubmitted: boolean('is_submitted').notNull().default(false),
    submittedDate: timestamp('submitted_date', { withTimezone: true }),
    prescriptionRequirement: prescriptionEnum('prescription_requirement'),
});