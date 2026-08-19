import { z } from "zod";

// Reusable Zod schemas for API responses
export const SuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        success: z.literal(true),
        data: dataSchema,
        message: z.string().optional(),
        timestamp: z.iso.datetime().optional(),
    });

export const ErrorResponseSchema = z.object({
    success: z.literal(false),
    code: z.string(),
    message: z.string(),
    field: z.string().optional(),
    fields: z.record(z.string(), z.string()).optional(),
    timestamp: z.iso.datetime().optional(),
});

// Helper functions
export const createSuccessResponse = <T>(data: T, message?: string) => ({
    success: true as const,
    data,
    ...(message && { message }),
    timestamp: new Date().toISOString(),
});

type ErrorResponseOptions = {
    field?: string;
    fields?: Record<string, string>;
};

export const createErrorResponse = (
    code: string,
    message: string,
    fieldOrOptions?: string | ErrorResponseOptions,
) => {
    const options: ErrorResponseOptions | undefined =
        typeof fieldOrOptions === "string"
            ? fieldOrOptions
                ? { field: fieldOrOptions }
                : undefined
            : fieldOrOptions;

    return {
        success: false as const,
        code,
        message,
        ...(options?.field && { field: options.field }),
        ...(options?.fields && { fields: options.fields }),
        timestamp: new Date().toISOString(),
    };
};
