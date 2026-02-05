import { describeRoute, resolver, validator } from "hono-openapi";
import z from "zod";
import { createErrorResponse, createSuccessResponse, ErrorResponseSchema, SuccessResponseSchema } from "../../_schemas";
import { createFactory } from "hono/factory";
import { db } from "../../../db";
import { applications } from "../../../db/schema/applications";
import { eq, sql } from "drizzle-orm";
import { renderMjmlTemplate } from "../../../services/email/email-template";
import { sendSimpleEmail } from "../../../services/email";
import { getAccountWithReferenceCode } from "../get/get-account";
import { format } from "date-fns"
import { accountHolderAuthorizationComplete, medicalDirectorCompletionConfirmation } from "./utils";
// Define your data schema
const responseSchema = z.object({

});

// Query schema
const querySchema = z.object({
    referenceCode: z.string().min(1, 'Reference Code is required.'),
    accountAuthorization: z.boolean().refine(val => val === true, {
        message: 'You must authorize your account.'
    }),
    prescriptionRequirement: z.enum(['withPrescription', 'withoutPrescription']),
    medicalDirectorEmail: z.string().default('')
});

const factory = createFactory();

const postApplication = factory.createHandlers(describeRoute({
    tags: ['Application'],
    summary: 'Post Application',
    description: 'Get pending application with Reference Code',
    responses: {
        200: {
            description: "Application data retrieved successfully",
            content: {
                "application/json": {
                    schema: resolver(SuccessResponseSchema(responseSchema))
                },
            },
        },
        400: {
            content: {
                "application/json": {
                    schema: resolver(ErrorResponseSchema),
                },
            },
            description: "Bad request - missing reference code",
        },
        404: {
            content: {
                "application/json": {
                    schema: resolver(ErrorResponseSchema),
                },
            },
            description: "Reference not found",
        },
        500: {
            content: {
                "application/json": {
                    schema: resolver(ErrorResponseSchema),
                },
            },
            description: "Internal server error",
        },
    },
}),
    validator("json", querySchema),
    async (c) => {
        const data = c.req.valid("json");
        try {
            const reference = await getAccountWithReferenceCode(data.referenceCode);
            const account = reference[0];
            await db.update(applications).set({
                isActive: false,
                isSubmitted: true,
                isExpired: true,
                prescriptionRequirement: data.prescriptionRequirement,
                submittedDate: sql`NOW()`
            }).where(eq(applications.referenceCode, data.referenceCode))

            const dateTime = format(new Date(), "dd/MM/yyyy hh:mm aa")
            const accountHolderEmail = account.accounts?.emailAddress
            const medicalDirectorEmail = account.medical_directors?.isAlsoMedicalDirector ? accountHolderEmail : account.medical_directors?.email
            const preferredLocation = account.accounts?.preferredLocation ?? 1
            const ccEmail = preferredLocation === 1 ? "rx@pacepharmacy.com" : "info@pacepharmacy.com"
            const from = preferredLocation === 1 ? `Pace Pharmacy (Leaside) <rx@pacepharmacy.com>` : `Pace Pharmacy (Downtown) <info@pacepharmacy.com>`

            if (medicalDirectorEmail) {
                await sendSimpleEmail({
                    from,
                    to: medicalDirectorEmail,
                    ccEmail: ccEmail,
                    subject: 'Medical Director Completion Confirmation',
                    body: renderMjmlTemplate('common', {
                        title: 'Medical Director Completion Confirmation',
                        content: medicalDirectorCompletionConfirmation(
                            {
                                accountHolderName: account.accounts?.holderName || '',
                                medicalDirectorName: account.medical_directors?.name || '',
                                organizationName: account.accounts?.organizationName || '',
                                prescriptionRequirement: data.prescriptionRequirement === 'withPrescription',
                                referenceCode: data.referenceCode,
                                dateTime
                            }
                        )
                    })
                })
            }

            if (accountHolderEmail) {
                await sendSimpleEmail({
                    from,
                    to: accountHolderEmail,
                    ccEmail: ccEmail,
                    subject: 'Account Holder - Medical Director Authorization Complete',
                    body: renderMjmlTemplate('common', {
                        title: 'Account Holder - Medical Director Authorization Complete',
                        content: accountHolderAuthorizationComplete(
                            {
                                accountHolderName: account.accounts?.holderName || '',
                                medicalDirectorName: account.medical_directors?.name || '',
                                referenceCode: data.referenceCode,
                                dateTime
                            }
                        )
                    })
                })
            }

            return c.json(createSuccessResponse({
                message: 'Application submitted successfully.'
            }));

        } catch (error) {
            return c.json(
                createErrorResponse(
                    "INTERNAL_SERVER_ERROR",
                    "An unexpected error occurred",
                    error instanceof Error ? error.message : undefined
                ),
                500
            );
        }
    });

export default postApplication;