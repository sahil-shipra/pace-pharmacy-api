import { db } from '../../../db';
import {
    accounts,
    addresses,
    deliverySettings,
    paymentInformation,
    acknowledgements,
    medicalDirectors,
} from '../../../db/schema';
import { applications } from '../../../db/schema/applications';
import { CreateAccountRequest } from './schema';

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

export async function createAccount(input: CreateAccountRequest, referenceCode: string) {
    try {
        return await db.transaction(async (tx) => {
            // 1. Create main account
            const [account] = await tx.insert(accounts).values({
                holderName: input.account.account.holderName,
                designation: input.account.account.designation,
                organizationName: input.account.account.organizationName,
                contactPerson: input.account.account.contactPerson,
                phone: input.account.phone,
                emailAddress: input.account.emailAddress,
                fax: input.account.fax,
                documents: input.account.documents,
                preferredLocation: input.preferredLocation ?? 1,
                shippingSameAsBilling: false
            }).returning();

            // 2. Create billing address
            await tx.insert(addresses).values({
                accountId: account.id,
                addressType: 'billing',
                addressLine1: input.account.billingAddress.addressLine_1,
                addressLine2: input.account.billingAddress.addressLine_2,
                city: input.account.billingAddress.city,
                province: input.account.billingAddress.province as any,
                postalCode: input.account.billingAddress.postalCode,
            });

            // 3. Create shipping address
            await tx.insert(addresses).values({
                accountId: account.id,
                addressType: 'shipping',
                addressLine1: input.account.shippingAddress.addressLine_1,
                addressLine2: input.account.shippingAddress.addressLine_2,
                city: input.account.shippingAddress.city,
                province: input.account.shippingAddress.province as any,
                postalCode: input.account.shippingAddress.postalCode,
            });

            // 4. Create delivery settings
            await tx.insert(deliverySettings).values({
                accountId: account.id,
                instruction: input.account.delivery?.instruction || null,
                deliveryHours: input.account.delivery?.hours || null,
            });

            // 5. Create payment information (store only last 4 digits)
            const cardNumberLast4 = input.payment.cardNumber.slice(-4);
            const [month, year] = input.payment.cardExpiryDate.split('/');

            await tx.insert(paymentInformation).values({
                accountId: account.id,
                paymentMethod: input.payment.paymentMethod as any,
                cardNumberLast4,
                nameOnCard: input.payment.nameOnCard,
                cardExpiryMonth: month,
                cardExpiryYear: year,
                paymentAuthorization: input.payment.paymentAuthorization,
            });

            // 6. Create acknowledgement
            await tx.insert(acknowledgements).values({
                accountId: account.id,
                nameToAcknowledge: input.acknowledgements.nameToAcknowledge,
                acknowledgementConsent: input.acknowledgements.acknowledgementConsent,
            });

            // 7. Create medical director information
            await tx.insert(medicalDirectors).values({
                accountId: account.id,
                isAlsoMedicalDirector: input.medical.isAlsoMedicalDirector,
                name: input.medical.name,
                licenseNo: input.medical.licenseNo,
                email: input.medical.email,
            });

            // 8. Create application for reference code
            await tx.insert(applications).values({
                accountId: account.id,
                referenceCode,
                isActive: input.medical.isAlsoMedicalDirector !== true,
                isSubmitted: input.medical.isAlsoMedicalDirector === true,
                isExpired: false
            });

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