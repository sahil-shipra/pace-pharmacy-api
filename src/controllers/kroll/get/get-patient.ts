import { describeRoute, validator } from "hono-openapi";
import { createFactory } from "hono/factory";
import { createErrorResponse, createSuccessResponse } from "@/controllers/_schemas";
import { getAllAccounts } from "./get-account";
import z from "zod";

const factory = createFactory();

const paramsSchema = z.object({
    id: z.string().min(1, "Patient ID is required"),
});

const getPatient = factory.createHandlers(
    describeRoute({
        tags: ["Kroll"],
        summary: "Get Patient",
        description: "Get patient with id for a Kroll update.",
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

        const [patient] = await getAllAccounts(Number(id));

        if (!patient)
            return c.json(
                createErrorResponse("NOT_FOUND", `No patient found for account ID: ${id}`),
                404
            );

        return c.json(
            createSuccessResponse({
                patient,
            })
        );
    }
);

export default getPatient;
