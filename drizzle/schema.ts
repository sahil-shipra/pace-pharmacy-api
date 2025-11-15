import { pgTable, unique, serial, text, timestamp, foreignKey, integer, boolean, jsonb, varchar, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const addressType = pgEnum("address_type", ['billing', 'shipping'])
export const paymentMethod = pgEnum("payment_method", ['visa', 'mastercard', 'amex', 'discover', 'paypal', 'bank_transfer'])
export const prescriptionRequirement = pgEnum("prescription_requirement", ['withPrescription', 'withoutPrescription'])
export const province = pgEnum("province", ['alberta', 'british_columbia', 'manitoba', 'new_brunswick', 'newfoundland_and_labrador', 'northwest_territories', 'nova_scotia', 'nunavut', 'ontario', 'prince_edward_island', 'quebec', 'saskatchewan', 'yukon'])


export const accounts = pgTable("accounts", {
	id: serial().primaryKey().notNull(),
	holderName: text("holder_name").notNull(),
	designation: text(),
	organizationName: text("organization_name").notNull(),
	contactPerson: text("contact_person").notNull(),
	phone: text().notNull(),
	emailAddress: text("email_address").notNull(),
	fax: text(),
	documents: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("accounts_email_address_unique").on(table.emailAddress),
]);

export const acknowledgements = pgTable("acknowledgements", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").notNull(),
	nameToAcknowledge: text("name_to_acknowledge").notNull(),
	acknowledgementConsent: boolean("acknowledgement_consent").default(false).notNull(),
	consentDate: timestamp("consent_date", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "acknowledgements_account_id_accounts_id_fk"
		}).onDelete("cascade"),
	unique("acknowledgements_account_id_unique").on(table.accountId),
]);

export const addresses = pgTable("addresses", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").notNull(),
	addressType: addressType("address_type").notNull(),
	addressLine1: text("address_line_1").notNull(),
	addressLine2: text("address_line_2"),
	city: text().notNull(),
	province: province().notNull(),
	postalCode: text("postal_code").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "addresses_account_id_accounts_id_fk"
		}).onDelete("cascade"),
]);

export const deliverySettings = pgTable("delivery_settings", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").notNull(),
	instruction: text(),
	deliveryHours: jsonb("delivery_hours"),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "delivery_settings_account_id_accounts_id_fk"
		}).onDelete("cascade"),
	unique("delivery_settings_account_id_unique").on(table.accountId),
]);

export const paymentInformation = pgTable("payment_information", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").notNull(),
	paymentMethod: paymentMethod("payment_method").notNull(),
	cardNumberLast4: text("card_number_last4"),
	nameOnCard: text("name_on_card"),
	cardExpiryMonth: text("card_expiry_month"),
	cardExpiryYear: text("card_expiry_year"),
	paymentAuthorization: boolean("payment_authorization").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "payment_information_account_id_accounts_id_fk"
		}).onDelete("cascade"),
	unique("payment_information_account_id_unique").on(table.accountId),
]);

export const medicalDirectors = pgTable("medical_directors", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").notNull(),
	isAlsoMedicalDirector: boolean("is_also_medical_director").default(false).notNull(),
	name: text(),
	licenseNo: text("license_no"),
	email: text(),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "medical_directors_account_id_accounts_id_fk"
		}).onDelete("cascade"),
	unique("medical_directors_account_id_unique").on(table.accountId),
]);

export const applications = pgTable("applications", {
	id: serial().primaryKey().notNull(),
	accountId: integer("account_id").notNull(),
	referenceCode: varchar("reference_code", { length: 28 }).notNull(),
	expiryDate: timestamp("expiry_date", { withTimezone: true, mode: 'string' }).default(sql`(now() + '14 days'::interval)`).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	isExpired: boolean("is_expired").default(false).notNull(),
	isSubmitted: boolean("is_submitted").default(false).notNull(),
	submittedDate: timestamp("submitted_date", { withTimezone: true, mode: 'string' }),
	prescriptionRequirement: prescriptionRequirement("prescription_requirement"),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [accounts.id],
			name: "applications_account_id_accounts_id_fk"
		}).onDelete("cascade"),
	unique("applications_account_id_unique").on(table.accountId),
	unique("applications_reference_code_unique").on(table.referenceCode),
]);

export const pharmacyLocations = pgTable("pharmacy_locations", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	addressLine: text("address_line").notNull(),
	pickupEnabled: boolean("pickup_enabled").default(false).notNull(),
	deliveryEnabled: boolean("delivery_enabled").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});
