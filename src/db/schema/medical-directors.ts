import { pgTable, serial, text, integer, boolean } from 'drizzle-orm/pg-core';
import { accounts } from './accounts';

export const medicalDirectors = pgTable('medical_directors', {
    id: serial('id').primaryKey(),
    accountId: integer('account_id')
        .references(() => accounts.id, { onDelete: 'cascade' })
        .notNull()
        .unique(),
    isAlsoMedicalDirector: boolean('is_also_medical_director').default(false).notNull(),
    name: text('name'),
    licenseNo: text('license_no'),
    email: text('email'),
});