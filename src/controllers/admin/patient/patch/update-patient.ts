import { createErrorResponse, createSuccessResponse } from "@/controllers/_schemas";
import { describeRoute, validator } from "hono-openapi";
import { createFactory } from "hono/factory";
import z from "zod";
import { updateAccount } from "./update-account";


export const AccountSchema = z.object({
    id: z.number(),
    holderName: z.string(),
    designation: z.string(),
    organizationName: z.string(),
    contactPerson: z.string(),
    phone: z.string(),
    emailAddress: z.email(),
    fax: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    preferredLocation: z.number(),
    shippingSameAsBilling: z.boolean()
});

export const AddressSchema = z.object({
    addressLine1: z.string(),
    addressLine2: z.string(),
    city: z.string(),
    province: z.string(),
    postalCode: z.string(),
});

export const MedicalDirectorSchema = z.object({
    id: z.number(),
    accountId: z.number(),
    isAlsoMedicalDirector: z.boolean(),
    name: z.string(),
    licenseNo: z.string(),
    email: z.string().optional().default(''),
});

export const requestSchema = z.object({
    account: AccountSchema,
    billingAddress: AddressSchema,
    shippingAddress: AddressSchema,
    medical_directors: MedicalDirectorSchema,
});

const paramsSchema = z.object({
    id: z.string(),
});

// Type inference:
export type AccountData = z.infer<typeof requestSchema>;

// export const requestSchema = z.any()

const factory = createFactory();
const updatePatient = factory.createHandlers(
    describeRoute({
        tags: ["Patient"],
        summary: "Update Patient",
        description: "",
        responses: {
            200: {
                description: "Successful response",
                content: {
                    "application/json": {

                    },
                },
            },
        },
    }),
    validator("param", paramsSchema),
    validator("json", requestSchema),
    async (c) => {
        try {
            const { id } = c.req.valid("param");
            const data = c.req.valid("json");
            await updateAccount(Number(id), data)
            console.log('update-patient params ---->', id)
            console.log('update-patient body ---->', data)
            return c.json(createSuccessResponse({
                data
            }))
        } catch (error: any) {
            return c.json(createErrorResponse(error.cause, error.message))
        }
    })

export default updatePatient;