import { createErrorResponse } from "@/controllers/_schemas";
import type { Context, Next } from "hono";

const API_KEYS = new Set([
    process.env.API_KEY,
    // add more keys as needed
]);

// Middleware
async function apiKeyMiddleware(c: Context, next: Next) {
    const apiKey =
        c.req.header("x-api-key")

    if (!apiKey || !API_KEYS.has(apiKey)) {
        return c.json(createErrorResponse('Invalid API Key',
            'The API key provided is invalid or missing. Please check your credentials and try again.')
            , 401)
    }

    await next();
}

export default apiKeyMiddleware