import { describeRoute, validator } from "hono-openapi";
import { createFactory } from "hono/factory";
import z from "zod";
import { getCompleteAccount } from "@/controllers/admin/patient/get/get-account";
import { renderMjmlTemplate } from "@/services/email/email-template";
import { medicalDirectorCompletionConfirmation } from "@/controllers/application/post/utils";
import { format } from "date-fns";
import puppeteer from 'puppeteer'
import { createErrorResponse } from "@/controllers/_schemas";

const factory = createFactory();

const paramsSchema = z.object({
    id: z.string().min(1, "Patient ID is required"),
});


const getMdApprovalEmail = factory.createHandlers(
    describeRoute({
        tags: ["Kroll"],
        summary: "Get Approval Email",
        description: "Get Medical Director Approval Email as PDF.",
        responses: {
            200: {
                description: "Successful response",
                content: {
                    "application/json": {},
                },
            },
        },
    }),
    validator("param", paramsSchema),
    async (c) => {
        const { id } = c.req.valid("param");

        if (typeof id !== "string" || id.trim().length === 0 || isNaN(Number(id))) {
            return c.json(
                createErrorResponse("INVALID_ID", "Account ID is required"),
                400
            );
        }

        const patient = await getCompleteAccount(Number(id)) //await getAllAccounts(Number(id));
        if (!patient) {
            return c.json(
                createErrorResponse("NOT_FOUND", `No patient found for account ID: ${id}`),
                404
            );
        }

        if (!patient.applications?.isSubmitted) {
            return c.json(
                createErrorResponse("NOT_FOUND", `The Medical Director has not completed the confirmation for the patient associated with account ID: ${id}.`),
                404
            );
        }

        const dateTime = format(patient.applications?.submittedDate ?? patient.accounts.updatedAt, "dd/MM/yyyy hh:mm aa")
        const html = renderMjmlTemplate('common', {
            title: 'Medical Director Completion Confirmation',
            content: medicalDirectorCompletionConfirmation(
                {
                    accountHolderName: patient.accounts?.holderName || '',
                    medicalDirectorName: patient.medical_directors?.name || '',
                    organizationName: patient.accounts?.organizationName || '',
                    prescriptionRequirement: patient.applications.prescriptionRequirement === 'withPrescription',
                    referenceCode: patient.applications?.referenceCode ?? '',
                    dateTime
                }
            )
        })

        const browser = await puppeteer.launch({
            headless: "shell"
        })

        const page = await browser.newPage()
        await page.setContent(html, { waitUntil: 'networkidle0' })

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true
        })

        await browser.close()

        return new Response(new Uint8Array(pdf), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="md-approval-email-${id}.pdf"`,
            },
        });
    }
);

export default getMdApprovalEmail;
