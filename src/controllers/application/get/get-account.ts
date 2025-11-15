import { and, eq } from "drizzle-orm";
import { db } from "../../../db";
import { accounts, medicalDirectors } from "../../../db/schema";
import { applications } from "../../../db/schema/applications";

// Get complete account with all related data
export async function getAccountWithReferenceCode(referenceCode: string) {
    const account = await db.select().from(applications)
        .leftJoin(accounts, eq(applications.accountId, accounts.id))
        .leftJoin(medicalDirectors, eq(applications.accountId, medicalDirectors.accountId))
        .where(
            and(
                eq(applications.referenceCode, referenceCode),
                // eq(applications.isActive, true)
            )
        );
    return account;
}
