import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { pharmacyLocations } from './pharmacy-location';

export const accounts = pgTable('accounts', {
    id: serial('id').primaryKey(),
    holderName: text('holder_name').notNull(),
    designation: text('designation'),
    organizationName: text('organization_name').notNull(),
    contactPerson: text('contact_person').notNull(),
    phone: text('phone').notNull(),
    emailAddress: text('email_address').notNull().unique(),
    fax: text('fax'),
    documents: text('documents'), // Could be JSON or file path
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    preferredLocation: integer("preferred_location")
        .notNull()
        .default(1)
        .references(() => pharmacyLocations.id), // no cascade rules
});