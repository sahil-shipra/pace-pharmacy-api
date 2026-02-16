import { describeRoute, validator } from "hono-openapi";
import { createFactory } from "hono/factory";
import { createErrorResponse, createSuccessResponse } from "@/controllers/_schemas";
import z from "zod";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { krollStatus } from "@/db/schema/kroll-status";

const factory = createFactory();

const requestSchema = z.object({
    status: z.enum(['pending', "complete"]).default('complete'),
});

const paramsSchema = z.object({
    id: z.string("ID is required to update a patient's Kroll status."),
});

const updatePatientKrollStatus = factory.createHandlers(
    describeRoute({
        tags: ["Kroll"],
        summary: "Update Patient Kroll Status",
        description: "PATCH API endpoint to update a patient's Kroll status.",
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
    validator("json", requestSchema),
    async (c) => {
        const { id } = c.req.valid("param");
        const data = c.req.valid("json");

        if (!Number(id)) {
            return c.json(createErrorResponse('404', "ID is required to update a patient's Kroll status."))
        }
        const accountRows = await db
            .select()
            .from(accounts)
            .where(eq(accounts.id, Number(id)))

        await db
            .update(krollStatus)
            .set({ status: data.status })
            .where(eq(krollStatus.accountId, Number(id)))
            .returning();

        if (!accountRows.length) {
            return c.json(createErrorResponse('404', `Patient with ID ${id} was not found in the data.`))
        }

        return c.json(
            createSuccessResponse({
                id,
                data
            })
        );
    }
);

export default updatePatientKrollStatus;
