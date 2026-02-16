import { describeRoute, validator } from "hono-openapi";
import { createFactory } from "hono/factory";
import { createSuccessResponse } from "@/controllers/_schemas";
import { getAllAccounts } from "./get-account";
import z from "zod";
import { renderToBuffer } from "@react-pdf/renderer";
import ExportPDF from "./explorable-pdf"

const factory = createFactory();

const paramsSchema = z.object({
    id: z.string(),
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
        const patient = await getAllAccounts(Number(id));
        return c.json(
            createSuccessResponse({
                patient,
            })
        );
    }
);

export default getPatientPdf;
