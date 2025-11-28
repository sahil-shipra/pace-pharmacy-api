import { db } from '@/db';
import {
    accounts,
    addresses,
    medicalDirectors,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm/sql';
import { AccountData } from './update-patient';

// Custom error class for database errors
export class DatabaseError extends Error {
    constructor(
        message: string,
        public code: string,
        public detail?: string,
        public constraint?: string
    ) {
        super(message);
        this.name = 'DatabaseError';
    }
}

export async function updateAccount(accountId: number, input: AccountData) {
    try {
        return await db.transaction(async (tx) => {
            // 1. Update account core details
            const [account] = await tx
                .update(accounts)
                .set({
                    holderName: input.account.holderName,
                    designation: input.account.designation,
                    organizationName: input.account.organizationName,
                    contactPerson: input.account.contactPerson,
                    phone: input.account.phone,
                    emailAddress: input.account.emailAddress,
                    fax: input.account.fax,
                    preferredLocation: input.account.preferredLocation,
                    shippingSameAsBilling: input.account.shippingSameAsBilling,
                    updatedAt: sql`NOW()`,
                })
                .where(eq(accounts.id, accountId))
                .returning();

            if (!account) {
                throw new DatabaseError('Account not found', 'NOT_FOUND');
            }

            const updateAddress = async (
                address: AccountData['billingAddress'],
                type: 'billing' | 'shipping'
            ) => {
                if (!address) return;

                const whereClause = and(
                    eq(addresses.accountId, accountId),
                    eq(addresses.addressType, type)
                );

                await tx
                    .update(addresses)
                    .set({
                        addressLine1: address.addressLine1,
                        addressLine2: address.addressLine2,
                        city: address.city,
                        province: address.province as any,
                        postalCode: address.postalCode,
                    })
                    .where(whereClause);
            };

            // 2. Update billing & shipping addresses
            await updateAddress(input.billingAddress, 'billing');
            await updateAddress(input.shippingAddress, 'shipping');

            // 3. Update medical director information
            if (input.medical_directors) {
                await tx
                    .update(medicalDirectors)
                    .set({
                        isAlsoMedicalDirector: input.medical_directors.isAlsoMedicalDirector,
                        name: input.medical_directors.name,
                        licenseNo: input.medical_directors.licenseNo,
                        email: input.medical_directors.email,
                    })
                    .where(eq(medicalDirectors.id, input.medical_directors.id));
            }

            return account;
        });
    } catch (error: any) {
        // Re-throw as DatabaseError for better handling in route
        if (error.code === '23505') {
            throw new DatabaseError(
                'Duplicate entry detected',
                error.code,
                error.detail,
                error.constraint
            );
        }
        throw error;
    }
}