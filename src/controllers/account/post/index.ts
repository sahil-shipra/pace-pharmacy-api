import { describeRoute, resolver, validator } from "hono-openapi";
import { createFactory } from "hono/factory";
import { requestSchema, responseSchema } from "./schema";
import { createAccount, DatabaseError } from "./create-account";
import { renderMjmlTemplate } from "../../../services/email/email-template";
import { sendSimpleEmail } from "../../../services/email";
import { generateReferenceCode } from "../../../services";
import { createErrorResponse, createSuccessResponse } from "../../_schemas";
import { accountHolderAuthorizationComplete } from "@/controllers/application/post/utils";
import { format } from "date-fns";
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
    validator("json", requestSchema),
    async (c) => {
        try {
            const data = c.req.valid("json");
            const referenceCode = generateReferenceCode();
            const dateTime = format(new Date(), "dd/MM/yyyy hh:mm aa")

            await createAccount(data, referenceCode);

            const directorEmail = data.medical.isAlsoMedicalDirector ? data.account.emailAddress : data.medical.email;
            const accountHolderEmail = data.account.emailAddress;
            const directorName = data.medical.name;
            const accountHolderName = data.account.account.holderName;
            const clinicName = data.account.account.organizationName;

            if (!data.medical.isAlsoMedicalDirector) {
                await sendSimpleEmail({
                    to: accountHolderEmail,
                    subject: 'Medical Director Authorization Request',
                    body: renderMjmlTemplate('medical-director-authorization-request', {
                        title: 'Medical Director Authorization Request',
                        directorName,
                        accountHolderName,
                        clinicName,
                        application: referenceCode,
                        link: `https://pacepharmacy.com/account-setup?code=${referenceCode}`
                    })
                })

                await sendSimpleEmail({
                    to: directorEmail,
                    subject: 'Account Holder Confirmation',
                    body: renderMjmlTemplate('account-holder-confirmation', {
                        title: 'Account Holder Confirmation',
                        directorName,
                        directorEmail: directorEmail,
                        accountHolderName,
                        clinicName,
                        application: referenceCode,
                        submittedDateTime: 'Test'
                    })
                })
            } else {
                await sendSimpleEmail({
                    to: accountHolderEmail,
                    subject: 'Account Holder - Medical Director Authorization Complete',
                    body: renderMjmlTemplate('common', {
                        title: 'Account Holder - Medical Director Authorization Complete',
                        content: accountHolderAuthorizationComplete(
                            {
                                accountHolderName,
                                medicalDirectorName: data.medical.name,
                                referenceCode,
                                dateTime,
                                skipAuthorization: true
                            }
                        )
                    })
                })
            }

            return c.json(createSuccessResponse({
                referenceCode
            }));
        } catch (error: any) {
            console.error('error', error.cause)
            const err = error.cause;

            if (err instanceof DatabaseError || error.cause.code) {
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