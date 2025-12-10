import { z } from 'zod';

// Zod v4 Schema
const accountSchema = z.object({
    holderName: z.string().min(1, 'Holder name is required'),
    designation: z.string().min(1, 'Designation is required'),
    organizationName: z.string().min(1, 'Organization name is required'),
    contactPerson: z.string().optional().default(''),
});

const addressSchema = z.object({
    addressLine_1: z.string().min(1, 'Address line 1 is required'),
    addressLine_2: z.string().min(1, 'Address line 2 is required'),
    city: z.string().min(1, 'City is required'),
    province: z.string().min(1, 'Province is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
});

const deliveryHoursSchema = z.object({
    Monday: z.string().optional().default(''),
    Tuesday: z.string().optional().default(''),
    Wednesday: z.string().optional().default(''),
    Thursday: z.string().optional().default(''),
    Friday: z.string().optional().default(''),
});

const deliverySchema = z.object({
    instruction: z.string().optional().default(''),
    hours: deliveryHoursSchema.optional().default({
        Monday: '',
        Tuesday: '',
        Wednesday: '',
        Thursday: '',
        Friday: ''
    }),
});

// For file validation in Zod v4
export const fileSchema = z.custom<File>((val) => val instanceof File, {
    message: 'Expected a File object',
});

export const accountFormSchema = z.object({
    account: accountSchema,
    billingAddress: addressSchema,
    shippingAddress: addressSchema,
    documents: z
        .any()
        .optional(),
    delivery: deliverySchema.optional(),
    phone: z.string().min(1, 'Phone is required'),
    emailAddress: z.string().min(1, 'Email Address is required'),
    fax: z.string().optional().default(''),
});

const medicalFormSchema = z.object({
    isAlsoMedicalDirector: z.boolean().optional().default(false),
    name: z.string().min(1, 'Name is required'),
    licenseNo: z.string().optional().default(''),
    email: z.string().optional().default(''),
}).refine(
    (data) => {
        if (data.isAlsoMedicalDirector === false) {
            return data.email && data.email.length > 0 && z.string().email().safeParse(data.email).success;
        }
        return true;
    },
    {
        message: 'Valid email is required',
        path: ['email'],
    }
);

export const paymentFormSchema = z.object({
    paymentMethod: z.string().default('visa'),
    cardNumber: z.string().min(1, 'Card Number is required'),
    nameOnCard: z.string().min(1, 'Name is required'),
    cardExpiryDate: z.string().min(1, 'Expiry Date is required'),
    cvv: z.string().min(1, 'CVV is required'),
    paymentAuthorization: z.boolean().default(false),
});


export const ackFormSchema = z.object({
    nameToAcknowledge: z.string().min(1, 'Name is required'),
    acknowledgementConsent: z.boolean().default(false),
});

// TypeScript Types (inferred from Zod schema)
export type ACKFormSchema = z.infer<typeof ackFormSchema>;
export type AccountFormSchema = z.infer<typeof accountFormSchema> & { sameAsBilling?: boolean };
export type MedicalFormSchema = z.infer<typeof medicalFormSchema>;
export type PaymentFormSchema = z.infer<typeof paymentFormSchema>;


export const requestSchema = z.object({
    account: accountFormSchema,
    payment: paymentFormSchema,
    medical: medicalFormSchema,
    acknowledgements: ackFormSchema,
    preferredLocation: z.number().default(1),
    sameAsBilling: z.boolean().optional().default(false),
})

export const responseSchema = z.object({
    success: z.boolean(),
    status: z.string()
})

export interface CreateAccountRequest {
    account: AccountFormSchema;
    payment: PaymentFormSchema;
    medical: MedicalFormSchema;
    acknowledgements: ACKFormSchema;
    preferredLocation: number
}