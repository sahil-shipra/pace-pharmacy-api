import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { accounts, acknowledgements, addresses, deliverySettings, medicalDirectors, paymentInformation } from "../../../db/schema";

// Get complete account with all related data
export async function getCompleteAccount(accountId: number) {
    const account = await db.select().from(accounts)
        .leftJoin(acknowledgements, eq(accounts.id, acknowledgements.accountId))
        .leftJoin(addresses, eq(accounts.id, addresses.accountId))
        .leftJoin(deliverySettings, eq(accounts.id, deliverySettings.accountId))
        .leftJoin(medicalDirectors, eq(accounts.id, medicalDirectors.accountId))
        .leftJoin(paymentInformation, eq(accounts.id, paymentInformation.accountId))
        .where(eq(accounts.id, accountId));
    return account;
}