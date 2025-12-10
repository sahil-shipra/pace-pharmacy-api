import { eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, acknowledgements, deliverySettings, medicalDirectors, paymentInformation, documentsTable } from "@/db/schema";
import { applications } from "@/db/schema/applications";
import { supabase } from "@/services/supabase-client";

// Get all accounts with related data
export async function getAllAccounts() {
    const accountRows = await db
        .select()
        .from(accounts)
        .leftJoin(acknowledgements, eq(accounts.id, acknowledgements.accountId))
        .leftJoin(deliverySettings, eq(accounts.id, deliverySettings.accountId))
        .leftJoin(medicalDirectors, eq(accounts.id, medicalDirectors.accountId))
        .leftJoin(paymentInformation, eq(accounts.id, paymentInformation.accountId))
        .leftJoin(applications, eq(accounts.id, applications.accountId));

    if (!accountRows.length) return [];

    // Fetch related collections in parallel
    const [addressesData, documents] = await Promise.all([db.query.addresses.findMany(), db.query.documentsTable.findMany()],);

    // Group addresses by accountId for fast lookup
    const addressesByAccount = addressesData.reduce((acc, addr) => {
        const bucket = acc.get(addr.accountId);
        if (bucket) {
            bucket.push(addr);
        } else {
            acc.set(addr.accountId, [addr]);
        }
        return acc;
    }, new Map<number, typeof addressesData>());

    const documentsByCode = documents.reduce((acc, docs) => {
        if (!docs.referenceCode) return acc;

        const bucket = acc.get(docs.referenceCode);
        if (bucket) {
            bucket.push(docs);
        } else {
            acc.set(docs.referenceCode, [docs]);
        }
        return acc;
    }, new Map<string | number, typeof documents>());

    const getDocuments = (code: string) => {
        const docs = documentsByCode.get(code)
        const BucketName = process.env.BUCKET_NAME!;
        if (!docs) return [];

        return docs.map((doc: any) => {
            const path = doc.path;
            const { data } = supabase.storage
                .from(BucketName)
                .getPublicUrl(path);

            return {
                ...doc,
                publicUrl: data.publicUrl,
            };
        });
    }

    // Merge the flat join results into structured accounts
    const grouped = new Map<number, any>();

    for (const row of accountRows) {
        const accId = row.accounts.id;
        const existing = grouped.get(accId);
        const code = row.applications?.referenceCode;

        const account = existing ?? {
            ...row.accounts,
            acknowledgements: [],
            deliverySettings: [],
            medicalDirectors: [],
            paymentInformation: [],
            applications: [],
            addresses: addressesByAccount.get(accId) || [],
            documents: code ? getDocuments(code) || [] : []
        };

        if (row.acknowledgements) account.acknowledgements.push(row.acknowledgements);
        if (row.delivery_settings) account.deliverySettings.push(row.delivery_settings);
        if (row.medical_directors) account.medicalDirectors.push(row.medical_directors);
        if (row.payment_information) account.paymentInformation.push(row.payment_information);
        if (row.applications) account.applications.push(row.applications);

        grouped.set(accId, account);
    }

    return Array.from(grouped.values());
}
