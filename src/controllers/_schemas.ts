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
    error: z.object({
        code: z.string(),
        message: z.string(),
        details: z.any().optional(),
    }),
    timestamp: z.iso.datetime().optional(),
});

// Helper functions
export const createSuccessResponse = <T>(data: T, message?: string) => ({
    success: true as const,
    data,
    ...(message && { message }),
    timestamp: new Date().toISOString(),
});

export const createErrorResponse = (code: string, message: string, details?: any) => ({
    success: false as const,
    error: {
        code,
        message,
        ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
});