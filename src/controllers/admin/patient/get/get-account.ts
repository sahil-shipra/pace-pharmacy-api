import { eq, sql, desc, and, or, isNull } from "drizzle-orm";
import { db } from "@/db";
import { accounts, acknowledgements, addresses, deliverySettings, medicalDirectors, paymentInformation } from "@/db/schema";
import { applications } from "@/db/schema/applications";
import { pharmacyLocations } from "@/db/schema/pharmacy-location";

// Get complete account with all related data
export async function getAllAccounts() {
    const account = await db.select().from(accounts)
        .leftJoin(acknowledgements, eq(accounts.id, acknowledgements.accountId))
        .leftJoin(addresses, eq(accounts.id, addresses.accountId))
        .leftJoin(deliverySettings, eq(accounts.id, deliverySettings.accountId))
        .leftJoin(medicalDirectors, eq(accounts.id, medicalDirectors.accountId))
        .leftJoin(paymentInformation, eq(accounts.id, paymentInformation.accountId))
    return account;
}

// Get paginated patient intakes with required fields
export async function getPaginatedPatientIntakes(
    page: number = 1,
    pageSize: number = 15,
    preferredLocation: "all" | "leaside" | "downtown" = "all",
    authStatus: "all" | "pending" | "completed" = "all"
) {
    const offset = (page - 1) * pageSize;

    // Build filter conditions
    const conditions = [];

    // Filter by preferred location
    if (preferredLocation !== "all") {
        conditions.push(eq(pharmacyLocations.key, preferredLocation));
    }

    // Filter by auth status
    if (authStatus !== "all") {
        if (authStatus === "completed") {
            conditions.push(eq(applications.isSubmitted, true));
        } else if (authStatus === "pending") {
            conditions.push(or(eq(applications.isSubmitted, false), isNull(applications.id)));
        }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count with filters
    const totalCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(accounts)
        .leftJoin(pharmacyLocations, eq(accounts.preferredLocation, pharmacyLocations.id))
        .leftJoin(applications, eq(accounts.id, applications.accountId))
        .where(whereClause);
    const totalCount = Number(totalCountResult[0]?.count || 0);

    // Get paginated data with filters
    const results = await db
        .select({
            accountId: accounts.id,
            createdAt: accounts.createdAt,
            updatedAt: accounts.updatedAt,
            accountHolderName: accounts.holderName,
            accountHolderEmail: accounts.emailAddress,
            medicalDirectorName: medicalDirectors.name,
            medicalDirectorLicense: medicalDirectors.licenseNo,
            medicalDirectorEmail: medicalDirectors.email,
            authStatus: sql<string>`CASE WHEN ${applications.isSubmitted} = true THEN 'Completed' ELSE 'Pending' END`.as('authStatus')
        })
        .from(accounts)
        .leftJoin(pharmacyLocations, eq(accounts.preferredLocation, pharmacyLocations.id))
        .leftJoin(medicalDirectors, eq(accounts.id, medicalDirectors.accountId))
        .leftJoin(applications, eq(accounts.id, applications.accountId))
        .where(whereClause)
        .orderBy(desc(accounts.createdAt))
        .limit(pageSize)
        .offset(offset);

    return {
        data: results,
        pagination: {
            page,
            pageSize,
            totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
        },
    };
}

// Get patient intake statistics
export async function getPatientIntakeStatistics(
    preferredLocation: "all" | "leaside" | "downtown" = "all",
    authStatus: "all" | "pending" | "completed" = "all"
) {
    // Build filter conditions
    const conditions = [];

    // Filter by preferred location
    if (preferredLocation !== "all") {
        conditions.push(eq(pharmacyLocations.key, preferredLocation));
    }

    // Filter by auth status
    if (authStatus !== "all") {
        if (authStatus === "completed") {
            conditions.push(eq(applications.isSubmitted, true));
        } else if (authStatus === "pending") {
            conditions.push(or(eq(applications.isSubmitted, false), isNull(applications.id)));
        }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get all statistics in a single query using conditional aggregation
    const statsResult = await db
        .select({
            totalIntakes: sql<number>`count(*)`,
            completed: sql<number>`count(CASE WHEN ${applications.isSubmitted} = true THEN 1 END)`,
            authPending: sql<number>`count(CASE WHEN ${applications.isSubmitted} = false OR ${applications.id} IS NULL THEN 1 END)`,
        })
        .from(accounts)
        .leftJoin(pharmacyLocations, eq(accounts.preferredLocation, pharmacyLocations.id))
        .leftJoin(applications, eq(accounts.id, applications.accountId))
        .where(whereClause);

    const stats = statsResult[0];

    return {
        totalIntakes: Number(stats?.totalIntakes || 0),
        completed: Number(stats?.completed || 0),
        authPending: Number(stats?.authPending || 0),
    };
}


export async function getCompleteAccount(accountId: number) {
    const [accountRows, addressesData] = await Promise.all([
        db
            .select()
            .from(accounts)
            .leftJoin(acknowledgements, eq(accounts.id, acknowledgements.accountId))
            .leftJoin(deliverySettings, eq(accounts.id, deliverySettings.accountId))
            .leftJoin(medicalDirectors, eq(accounts.id, medicalDirectors.accountId))
            .leftJoin(paymentInformation, eq(accounts.id, paymentInformation.accountId))
            .leftJoin(applications, eq(accounts.id, applications.accountId))
            .where(eq(accounts.id, accountId)),
        db.query.addresses.findMany({ where: eq(addresses.accountId, accountId) }),
    ]);

    if (!accountRows.length) return null;

    const account = accountRows[0];
    if (!account) return null;

    return {
        ...account,
        addresses: addressesData,
    };
}

export async function getAccountWithMedicalDirectors(accountId: number) {
    const rows = await db
        .select()
        .from(accounts)
        .leftJoin(medicalDirectors, eq(accounts.id, medicalDirectors.accountId))
        .leftJoin(applications, eq(accounts.id, applications.accountId))
        .where(eq(accounts.id, accountId));

    if (!rows.length) return null;

    const account = rows[0];

    return account;
}
