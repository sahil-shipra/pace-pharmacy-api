import { describeRoute, resolver, validator } from "hono-openapi";
import { createFactory } from "hono/factory";
import { requestSchema, responseSchema } from "./schema";
import { createAccount, DatabaseError } from "./create-account";
import { generateReferenceCode } from "../../../services";
import { createErrorResponse, createSuccessResponse } from "../../_schemas";
import { fileUpload, sendEmailToNewAccount } from "../utils";
const factory = createFactory();

const postAccount = factory.createHandlers(
    describeRoute({
        tags: ["Account"],
        summary: "New Account",
        description: "",
        responses: {
            200: {
                description: "Successful response",
                content: {
                    "application/json": {
                        schema: resolver(responseSchema),
                    },
                },
            },
        },
    }),
    // validator("json", requestSchema),
    async (c) => {
        try {
            // const data = c.req.valid("json");
            const formData = await c.req.formData()
            const files = formData.getAll('documents')

            const jsonString = formData.get('json');
            let data;
            if (typeof jsonString === 'string') {
                data = JSON.parse(jsonString);
            } else {
                throw new Error('No JSON data found in formData');
            }

            const referenceCode = generateReferenceCode();

            if (files && files.length) {
                await fileUpload(formData, referenceCode)
            }

            await createAccount(data, referenceCode);

            const directorEmail = data.medical.isAlsoMedicalDirector ? data.account.emailAddress : data.medical.email;
            const accountHolderEmail = data.account.emailAddress;
            const accountHolderPhone = data.account.phone;
            const directorName = data.medical.name;
            const accountHolderName = data.account.account.holderName;
            const clinicName = data.account.account.organizationName;
            const isAlsoMedicalDirector = data.medical.isAlsoMedicalDirector ?? false
            const preferredLocation = data.preferredLocation

            sendEmailToNewAccount({
                isAlsoMedicalDirector,
                directorEmail,
                directorName,
                accountHolderPhone,
                accountHolderEmail,
                accountHolderName,
                clinicName,
                referenceCode,
                preferredLocation
            })

            return c.json(createSuccessResponse({
                referenceCode
            }));
        } catch (error: any) {
            console.error('error', error)
            const err = error.cause;

            if (err instanceof DatabaseError || (error.cause && error.cause.code)) {
                const field = getDuplicateField(err);
                const friendlyField = getFriendlyFieldName(field);

                return c.json(createErrorResponse(
                    'DUPLICATE_ENTRY',
                    `An account with this ${friendlyField} already exists`,
                    field
                ), 409);
            }

            // Handle standard Postgres duplicate error (fallback)
            if (isDuplicateError(error)) {
                const field = getDuplicateField(error);
                const friendlyField = getFriendlyFieldName(field);

                return c.json({
                    success: false,
                    error: 'DUPLICATE_ENTRY',
                    message: `An account with this ${friendlyField} already exists`,
                    field: field
                }, 409);
            }

            // Handle validation errors
            if (error.name === 'ValidationError') {
                return c.json({
                    success: false,
                    error: 'VALIDATION_ERROR',
                    message: error.message
                }, 400);
            }

            return c.json(
                createErrorResponse(
                    "INTERNAL_SERVER_ERROR",
                    "An unexpected error occurred",
                    error instanceof Error ? error.message : undefined
                ),
                500
            );
        }
    }
);

export default postAccount;

// Helper function to check if error is a Postgres duplicate key error
function isDuplicateError(error: unknown): boolean {
    return (
        error instanceof Error &&
        'code' in error &&
        error.code === '23505' // Postgres unique violation code
    );
}

// Extract the column name from the error message
function getDuplicateField(error: any): string {
    const detailMatch = error.detail?.match(/Key \(([^)]+)\)/);
    return detailMatch ? detailMatch[1] : 'field';
}

// Get user-friendly field names
function getFriendlyFieldName(field: string): string {
    const fieldMap: Record<string, string> = {
        'email_address': 'email address',
        'phone': 'phone number',
        'reference_code': 'reference code',
        'license_no': 'license number',
        // Add more mappings as needed
    };
    return fieldMap[field] || field;
}