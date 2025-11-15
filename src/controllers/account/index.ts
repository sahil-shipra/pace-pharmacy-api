import { Hono } from "hono";
import {
    validator,
    resolver,
    describeRoute
} from "hono-openapi";
import z from "zod";
import postAccount from "./post";
import { getCompleteAccount } from "./get/get-account";

// Validation for query parameters, eg - `/hello?name=John`
const querySchema = z.object({
    name: z.string().optional(),
});
// Validation for response body, eg - `"Hello, John!"`
const responseSchema = z.string();

const account = new Hono();

account.get(
    "/",
    describeRoute({
        tags: ['Account'],
        summary: 'Account',
        description: '',
        responses: {
            200: {
                description: "Successful response",
                content: {
                    "application/json": {
                        schema: resolver(responseSchema),
                    },
                },
            },
        },
    }),
    validator("query", querySchema),
    async (c) => {
        
        const account = await getCompleteAccount(2)
        return c.json({ account });
    },
);

account.post(
    "/",
    ...postAccount,
);

export default account;