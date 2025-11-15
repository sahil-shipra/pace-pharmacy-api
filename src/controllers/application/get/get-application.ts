import { describeRoute, resolver, validator } from "hono-openapi";
import z from "zod";
import { createErrorResponse, createSuccessResponse, ErrorResponseSchema, SuccessResponseSchema } from "../../_schemas";
import { createFactory } from "hono/factory";
import { getAccountWithReferenceCode } from "./get-account";


// Define your data schema
const responseSchema = z.object({
    application: z.any().optional(),
    accountHolder: z.string().optional(),
    organizationName: z.string().optional(),
    medicalDirectorName: z.string().optional(),
    medicalDirectorEmail: z.string().optional(),
});

// Query schema
const querySchema = z.object({
    referenceCode: z.string().min(1),
});

const factory = createFactory();

const getApplication = factory.createHandlers(describeRoute({
    tags: ['Application'],
    summary: 'Get Application',
    description: 'Get pending application with Reference Code',
    responses: {
        200: {
            description: "Application data retrieved successfully",
            content: {
                "application/json": {
                    schema: resolver(SuccessResponseSchema(responseSchema))
                },
            },
        },
        400: {
            content: {
                "application/json": {
                    schema: resolver(ErrorResponseSchema),
                },
            },
            description: "Bad request - missing reference code",
        },
        404: {
            content: {
                "application/json": {
                    schema: resolver(ErrorResponseSchema),
                },
            },
            description: "Reference not found",
        },
        500: {
            content: {
                "application/json": {
                    schema: resolver(ErrorResponseSchema),
                },
            },
            description: "Internal server error",
        },
    },
}),
    validator("query", querySchema),
    async (c) => {
        const query = c.req.valid("query");
        if (!query.referenceCode) return c.json({});
        try {
            const reference = await getAccountWithReferenceCode(query.referenceCode);
            if (!reference || !reference.length) {
                return c.json(
                    createErrorResponse(
                        "REFERENCE_NOT_FOUND",
                        "No account found with the provided reference code"
                    ),
                    404
                );
            }

            const data = reference[0];
            return c.json(
                createSuccessResponse({
                    application: data.applications,
                    accountHolder: data.accounts?.holderName,
                    organizationName: data.accounts?.organizationName,
                    medicalDirectorName: data.medical_directors?.name,
                    medicalDirectorEmail: data.medical_directors?.isAlsoMedicalDirector ? data.accounts?.emailAddress : data.medical_directors?.email,
                }),
                200
            );
        } catch (error) {
            return c.json(
                createErrorResponse(
                    "INTERNAL_SERVER_ERROR",
                    "An unexpected error occurred",
                    error instanceof Error ? error.message : undefined
                ),
                500
            );
        }
    });

export default getApplication;