import { relations } from "drizzle-orm/relations";
import { accounts, acknowledgements, addresses, deliverySettings, paymentInformation, medicalDirectors, applications } from "./schema";

export const acknowledgementsRelations = relations(acknowledgements, ({one}) => ({
	account: one(accounts, {
		fields: [acknowledgements.accountId],
		references: [accounts.id]
	}),
}));

export const accountsRelations = relations(accounts, ({many}) => ({
	acknowledgements: many(acknowledgements),
	addresses: many(addresses),
	deliverySettings: many(deliverySettings),
	paymentInformations: many(paymentInformation),
	medicalDirectors: many(medicalDirectors),
	applications: many(applications),
}));

export const addressesRelations = relations(addresses, ({one}) => ({
	account: one(accounts, {
		fields: [addresses.accountId],
		references: [accounts.id]
	}),
}));

export const deliverySettingsRelations = relations(deliverySettings, ({one}) => ({
	account: one(accounts, {
		fields: [deliverySettings.accountId],
		references: [accounts.id]
	}),
}));

export const paymentInformationRelations = relations(paymentInformation, ({one}) => ({
	account: one(accounts, {
		fields: [paymentInformation.accountId],
		references: [accounts.id]
	}),
}));

export const medicalDirectorsRelations = relations(medicalDirectors, ({one}) => ({
	account: one(accounts, {
		fields: [medicalDirectors.accountId],
		references: [accounts.id]
	}),
}));

export const applicationsRelations = relations(applications, ({one}) => ({
	account: one(accounts, {
		fields: [applications.accountId],
		references: [accounts.id]
	}),
}));