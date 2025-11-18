import { createErrorResponse, createSuccessResponse } from "@/controllers/_schemas";
import { describeRoute, validator } from "hono-openapi"
import { createFactory } from "hono/factory";
import z from "zod"
import { getCompleteAccount } from "../get/get-account";

export const requestSchema = z.object({
    id: z.string().min(1, ''),
})

const factory = createFactory();

const getPatient = factory.createHandlers(
    describeRoute({
        tags: ["Patient"],
        summary: "Get Patient",
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
    validator("param", requestSchema),
    async (c) => {
        try {
            const { id } = c.req.valid("param");
            const account = await getCompleteAccount(Number(id))
            return c.json(createSuccessResponse({
                ...account
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

export default getPatient;