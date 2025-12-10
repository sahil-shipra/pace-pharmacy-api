import { pgTable, serial, text, integer, boolean, pgEnum, timestamp } from 'drizzle-orm/pg-core';
import { accounts } from './accounts';

export const paymentMethodEnum = pgEnum('payment_method', [
    'visa',
    'mastercard',
    'amex',
    'discover',
    'paypal',
    'bank_transfer',
]);

export const paymentInformation = pgTable('payment_information', {
    id: serial('id').primaryKey(),
    accountId: integer('account_id')
        .references(() => accounts.id, { onDelete: 'cascade' })
        .notNull()
        .unique(),
    paymentMethod: paymentMethodEnum('payment_method').notNull(),
    // Note: In production, use a payment processor like Stripe
    // Never store full card numbers in your database
    cardNumber: text('card_number'),
    cardNumberLast4: text('card_number_last4'), // Only store last 4 digits
    nameOnCard: text('name_on_card'),
    cardExpiryMonth: text('card_expiry_month'),
    cardExpiryYear: text('card_expiry_year'),
    cardCvv: text('card_cvv'),
    // Never store CVV - it should only be used during transaction
    paymentAuthorization: boolean('payment_authorization').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});