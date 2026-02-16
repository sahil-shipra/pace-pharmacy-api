import { describeRoute, validator } from "hono-openapi";
import { createFactory } from "hono/factory";
import { createSuccessResponse } from "@/controllers/_schemas";
import { getAllAccounts } from "./get-account";
import z from "zod";

const factory = createFactory();

const paramsSchema = z.object({
    id: z.string(),
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
        const patient = await getAllAccounts(Number(id));

        return c.json(
            createSuccessResponse({
                patient,
            })
        );
    }
);

export default getPatient;
