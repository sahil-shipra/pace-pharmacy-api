import { describeRoute, resolver } from "hono-openapi";
import { createFactory } from "hono/factory";
import { responseSchema } from "./schema";
import { createAccount, DatabaseError } from "./create-account";
import { generateReferenceCode } from "../../../services";
import { createErrorResponse, createSuccessResponse } from "../../_schemas";
import { fileUpload, sendEmailToNewAccount } from "../utils";
import * as Sentry from "@sentry/bun";
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
            console.error('error', error);

            const pgError = getPostgresError(error);

            if (pgError) {
                if (pgError.code === '23505') {
                    const field = getConstraintField(pgError);
                    const friendlyField = getFriendlyFieldName(field);

                    return c.json(createErrorResponse(
                        'DUPLICATE_ENTRY',
                        `An account with this ${friendlyField} already exists. Try logging in instead, or use a different ${friendlyField}.`,
                        { field }
                    ), 409);
                }

                if (pgError.code === '23503') {
                    return c.json(createErrorResponse(
                        'INVALID_REFERENCE',
                        'Some of the information you provided is no longer valid. Please check your details and try again.'
                    ), 400);
                }

                if (pgError.code === '23502') {
                    const field = pgError.column || getNotNullField(pgError);
                    return c.json(createErrorResponse(
                        'MISSING_REQUIRED_FIELD',
                        'Please fill in all required fields and try again.',
                        field ? { field } : undefined
                    ), 400);
                }

                if (pgError.code === '23514') {
                    return c.json(createErrorResponse(
                        'INVALID_VALUE',
                        'One of the values you entered is not allowed. Please check your information and try again.'
                    ), 400);
                }
            }

            if (isValidationError(error)) {
                const mapped = mapValidationError(error);
                return c.json(createErrorResponse(
                    'VALIDATION_ERROR',
                    mapped.message,
                    {
                        ...(mapped.field && { field: mapped.field }),
                        ...(mapped.fields && { fields: mapped.fields }),
                    }
                ), 400);
            }

            // Unexpected error → Sentry
            const sentryError = error instanceof Error
                ? error
                : new Error(String(error));
            sentryError.name = "AccountCreationError";
            Sentry.captureException(sentryError);

            return c.json(
                createErrorResponse(
                    "INTERNAL_SERVER_ERROR",
                    "Something went wrong on our end. Please try again in a moment."
                ),
                500
            );
        }
    }
);

export default postAccount;

type PostgresErrorLike = {
    code: string;
    detail?: string;
    constraint?: string;
    column?: string;
    message?: string;
};

function getPostgresError(error: unknown): PostgresErrorLike | null {
    if (!error || typeof error !== 'object') return null;

    const e = error as Record<string, unknown>;

    if (error instanceof DatabaseError) {
        return {
            code: error.code,
            detail: error.detail,
            constraint: error.constraint,
            message: error.message,
        };
    }

    if (typeof e.code === 'string' && /^\d{5}$/.test(e.code)) {
        return {
            code: e.code,
            detail: typeof e.detail === 'string' ? e.detail : undefined,
            constraint: typeof e.constraint === 'string' ? e.constraint : undefined,
            column: typeof e.column === 'string' ? e.column : undefined,
            message: typeof e.message === 'string' ? e.message : undefined,
        };
    }

    if (e.cause) {
        return getPostgresError(e.cause);
    }

    return null;
}

function getConstraintField(error: PostgresErrorLike): string {
    const detailMatch = error.detail?.match(/Key \(([^)]+)\)/);
    if (detailMatch?.[1]) return detailMatch[1];

    if (error.constraint) {
        const constraintMatch = error.constraint.match(/(?:_|^)([a-z0-9_]+?)(?:_key|_unique)?$/i);
        if (constraintMatch?.[1] && constraintMatch[1] !== 'key') {
            return constraintMatch[1];
        }
    }

    return 'field';
}

function getNotNullField(error: PostgresErrorLike): string | undefined {
    const columnMatch = error.message?.match(/null value in column "([^"]+)"/i);
    return columnMatch?.[1];
}

function getFriendlyFieldName(field: string): string {
    const fieldMap: Record<string, string> = {
        email_address: 'email address',
        emailAddress: 'email address',
        email: 'email address',
        phone: 'phone number',
        reference_code: 'reference code',
        license_no: 'license number',
        licenseNo: 'license number',
        card_number: 'card number',
        cardNumber: 'card number',
    };
    return fieldMap[field] || field.replace(/_/g, ' ');
}

const VALIDATION_FIELD_MESSAGES: Record<string, string> = {
    email: 'Please enter a valid email address.',
    emailAddress: 'Please enter a valid email address.',
    'account.emailAddress': 'Please enter a valid email address.',
    'medical.email': 'Please enter a valid email address.',
    phone: 'Please enter a valid phone number.',
    'account.phone': 'Please enter a valid phone number.',
    firstName: 'Please enter a first name.',
    lastName: 'Please enter a last name.',
    holderName: 'Please enter the account holder name.',
    organizationName: 'Please enter the organization name.',
    licenseNo: 'Please enter a valid license number.',
    'medical.licenseNo': 'Please enter a valid license number.',
    cardNumber: 'Please enter a valid card number.',
    'payment.cardNumber': 'Please enter a valid card number.',
    nameOnCard: 'Please enter the name on the card.',
    cardExpiryDate: 'Please enter a valid card expiry date.',
    cvv: 'Please enter a valid CVV.',
    postalCode: 'Please enter a valid postal code.',
};

function getFriendlyValidationMessage(fieldPath: string, _rawMessage?: string): string {
    const leaf = fieldPath.split('.').pop() || fieldPath;
    return (
        VALIDATION_FIELD_MESSAGES[fieldPath] ||
        VALIDATION_FIELD_MESSAGES[leaf] ||
        `Please check the ${getFriendlyFieldName(leaf)} and try again.`
    );
}

function isValidationError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const e = error as { name?: string; issues?: unknown };
    return (
        e.name === 'ValidationError' ||
        e.name === 'ZodError' ||
        Array.isArray(e.issues)
    );
}

function mapValidationError(error: any): {
    message: string;
    field?: string;
    fields?: Record<string, string>;
} {
    const fields: Record<string, string> = {};

    if (Array.isArray(error.issues)) {
        for (const issue of error.issues) {
            const path = Array.isArray(issue.path) && issue.path.length
                ? issue.path.join('.')
                : 'form';
            if (!fields[path]) {
                fields[path] = getFriendlyValidationMessage(path, issue.message);
            }
        }
    } else if (error.fields && typeof error.fields === 'object') {
        for (const [key, value] of Object.entries(error.fields)) {
            fields[key] = getFriendlyValidationMessage(
                key,
                typeof value === 'string' ? value : undefined
            );
        }
    } else if (Array.isArray(error.errors)) {
        for (const err of error.errors) {
            const key = err.path?.join?.('.') || err.field || err.path || 'form';
            if (!fields[key]) {
                fields[key] = getFriendlyValidationMessage(key, err.message);
            }
        }
    }

    const fieldKeys = Object.keys(fields);
    if (fieldKeys.length === 0) {
        return {
            message: 'Please check the information you entered and try again.',
        };
    }

    if (fieldKeys.length === 1) {
        return {
            message: fields[fieldKeys[0]],
            field: fieldKeys[0],
            fields,
        };
    }

    return {
        message: 'Please check the highlighted fields and try again.',
        fields,
    };
}