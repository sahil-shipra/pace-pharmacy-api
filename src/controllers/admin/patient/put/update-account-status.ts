import { createErrorResponse, createSuccessResponse } from "@/controllers/_schemas";
import { db } from "@/db";
import { accountStatusTable } from "@/db/schema/account-status";
import { describeRoute, validator } from "hono-openapi";
import { createFactory } from "hono/factory";
import z from "zod";

export const requestSchema = z.object({
    accountId: z.number().int().positive(),
    isActive: z.boolean()
})

const factory = createFactory();
const updateAccountStatus = factory.createHandlers(
    describeRoute({
        tags: ["Admin"],
        summary: "Update Account Status",
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
            const { accountId, isActive } = c.req.valid("json");
            await db.insert(accountStatusTable)
                .values({ accountId, isActive })
                .onConflictDoUpdate({
                    target: accountStatusTable.accountId, // The column(s) that cause the conflict (e.g., primary key)
                    set: {
                        isActive: isActive,
                        updatedAt: new Date()
                    }, // The values to update if a conflict occurs
                });
            return c.json(createSuccessResponse({
                message: "Status update successful."
            }))
        } catch (error: any) {
            return c.json(createErrorResponse(error.cause, error.message))
        }
    })

export default updateAccountStatus;