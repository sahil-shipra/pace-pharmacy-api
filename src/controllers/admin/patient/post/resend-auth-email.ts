import { createErrorResponse, createSuccessResponse } from "@/controllers/_schemas";
import { authMiddleware } from "@/controllers/admin/auth";
import { describeRoute, validator } from "hono-openapi"
import { createFactory } from "hono/factory";
import z from "zod"
import { sendEmailToNewAccount } from "@/controllers/account/utils";
import { getAccountWithMedicalDirectors } from "../get/get-account";

export const requestSchema = z.object({
    accountId: z.number().int().positive(),
})

const factory = createFactory();
const resendAuthEmail = factory.createHandlers(
    authMiddleware,
    describeRoute({
        tags: ["Patient"],
        summary: "Resend Auth Email",
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
    validator("json", requestSchema),
    async (c) => {
        try {
            const { accountId } = c.req.valid("json");
            const account = await getAccountWithMedicalDirectors(accountId)
            if (!account || !account.medical_directors || !account.accounts || !account.applications) { throw Error('') }

            const directorEmail = account.medical_directors.isAlsoMedicalDirector ? account.accounts.emailAddress : account.medical_directors.email ?? '';
            const accountHolderEmail = account.accounts.emailAddress;
            const directorName = account.medical_directors.name ?? 'Medical Director';
            const accountHolderName = account.accounts.holderName;
            const clinicName = account.accounts.organizationName;
            const isAlsoMedicalDirector = account.medical_directors.isAlsoMedicalDirector ?? false
            const referenceCode = account.applications.referenceCode;

            await sendEmailToNewAccount({
                isAlsoMedicalDirector,
                directorEmail,
                directorName,

                accountHolderEmail,
                accountHolderName,
                clinicName,
                referenceCode
            })

            return c.json(createSuccessResponse({
                message: 'Authentication email sent successfully.'
            }))
        } catch (error: any) {
            console.error('resend-auth-email error', error)
            return c.json(createErrorResponse(
                "INTERNAL_SERVER_ERROR",
                "An unexpected error occurred",
                error instanceof Error ? error.message : undefined
            ))
        }
    }
)

export default resendAuthEmail;