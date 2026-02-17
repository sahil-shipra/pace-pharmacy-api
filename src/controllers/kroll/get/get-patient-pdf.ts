import { describeRoute, validator } from "hono-openapi";
import { createFactory } from "hono/factory";
import z from "zod";
import { renderToBuffer } from "@react-pdf/renderer";
import ExportPDF from "./pdf/explorable-pdf"
import { getCompleteAccount } from "@/controllers/admin/patient/get/get-account";
import React from "react";
import { createErrorResponse } from "@/controllers/_schemas";

const factory = createFactory();

const paramsSchema = z.object({
    id: z.string().min(1, "Patient ID is required"),
});

const getPatientPdf = factory.createHandlers(
    describeRoute({
        tags: ["Kroll"],
        summary: "Get Patient PDF",
        description: "Get patient data as pdf with id for.",
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

        const patient: any = await getCompleteAccount(Number(id))
        
        if (!patient) {
            return c.json(
                createErrorResponse("NOT_FOUND", `No patient found for account ID: ${id}`),
                404
            );
        }

        const pdfDocument = React.createElement(ExportPDF, { data: patient }) as any;
        const buffer = await renderToBuffer(pdfDocument);

        return new Response(new Uint8Array(buffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="patient-account-${id}.pdf"`,
            },
        });
    }
);

export default getPatientPdf;
