import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const pharmacyLocations = pgTable('pharmacy_locations', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    key: text('key').notNull(),
    addressLine: text('address_line').notNull(),
    pickupEnabled: boolean('pickup_enabled').default(false).notNull(),
    deliveryEnabled: boolean('delivery_enabled').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});