import { pgTable, serial, text, integer, pgEnum } from 'drizzle-orm/pg-core';
import { accounts } from './accounts';

export const addressTypeEnum = pgEnum('address_type', ['billing', 'shipping']);
export const provinceEnum = pgEnum('province', [
    'alberta',
    'british_columbia',
    'manitoba',
    'new_brunswick',
    'newfoundland_and_labrador',
    'northwest_territories',
    'nova_scotia',
    'nunavut',
    'ontario',
    'prince_edward_island',
    'quebec',
    'saskatchewan',
    'yukon',
]);

export const addresses = pgTable('addresses', {
    id: serial('id').primaryKey(),
    accountId: integer('account_id')
        .references(() => accounts.id, { onDelete: 'cascade' })
        .notNull(),
    addressType: addressTypeEnum('address_type').notNull(),
    addressLine1: text('address_line_1').notNull(),
    addressLine2: text('address_line_2'),
    city: text('city').notNull(),
    province: provinceEnum('province').notNull(),
    postalCode: text('postal_code').notNull(),
});