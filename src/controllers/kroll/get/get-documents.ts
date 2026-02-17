import { createFactory } from "hono/factory";
import z from "zod";
import { describeRoute, validator } from "hono-openapi";
import { createErrorResponse, createSuccessResponse } from "@/controllers/_schemas";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { documentsTable } from "@/db/schema/documents-table";
import { supabase } from "@/services/supabase-client";
import { applications } from "drizzle/schema";

const paramsSchema = z.object({
    id: z.string().min(1, "Patient ID is required"),
});

const factory = createFactory();
const getDocuments = factory.createHandlers(
    describeRoute({
        tags: ["Kroll"],
        summary: "Get Patient Documents",
        description: "Get all uploaded documents for a given reference code",
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
        try {
            const { id } = c.req.valid("param");

            if (typeof id !== "string" || id.trim().length === 0 || isNaN(Number(id))) {
                return c.json(
                    createErrorResponse("INVALID_ID", "Account ID is required"),
                    400
                );
            }

            const [patient] = await db
                .select()
                .from(applications)
                .where(eq(applications.accountId, Number(id)));

            if (!patient) {
                return c.json(
                    createErrorResponse("NOT_FOUND", `No patient found for account ID: ${id}`),
                    404
                );
            }

            if (!patient.referenceCode) {
                return c.json(
                    createErrorResponse("NOT_FOUND", `No reference code found for account ID: ${id}`),
                    404
                );
            }

            const docs = await db
                .select()
                .from(documentsTable)
                .where(eq(documentsTable.referenceCode, patient.referenceCode));

            const bucketName = process.env.BUCKET_NAME!;

            const documentsWithPublicUrl = docs.map((doc: any) => {
                const { data } = supabase.storage
                    .from(bucketName)
                    .getPublicUrl(doc.path);

                return {
                    id: doc.id,
                    createdAt: doc.createdAt,
                    url: data.publicUrl,
                    updatedAt: doc.updatedAt,
                };
            });

            return c.json(
                createSuccessResponse({
                    docs: documentsWithPublicUrl,
                })
            );
        } catch (error: any) {
            console.error("get-documents error", error);
            return c.json(
                createErrorResponse(
                    "INTERNAL_SERVER_ERROR",
                    "An unexpected error occurred",
                    error instanceof Error ? error.message : undefined
                ),
                500
            );
        }
    }
);

export default getDocuments;