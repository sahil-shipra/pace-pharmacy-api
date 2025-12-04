import { createFactory } from "hono/factory";
import z from "zod";
import { authMiddleware } from "../../auth";
import { describeRoute, validator } from "hono-openapi";
import { createErrorResponse, createSuccessResponse } from "@/controllers/_schemas";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { documentsTable } from "@/db/schema/documents-table";
import { supabase } from "@/services/supabase-client";

const paramSchema = z.object({
    code: z.string().min(1, "Reference Code is required"),
});

const factory = createFactory();
const getDocuments = factory.createHandlers(
    authMiddleware,
    describeRoute({
        tags: ["Patient"],
        summary: "Get Documents",
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
    validator("param", paramSchema),
    async (c) => {
        try {
            const { code } = c.req.valid("param");

            const docs = await db
                .select()
                .from(documentsTable)
                .where(eq(documentsTable.referenceCode, code));

            const BucketName = process.env.BUCKET_NAME!;

            const documentsWithPublicUrl = docs.map((doc: any) => {
                const path = doc.path;
                const { data } = supabase.storage
                    .from(BucketName)
                    .getPublicUrl(path);

                return {
                    ...doc,
                    publicUrl: data.publicUrl,
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
                )
            );
        }
    } //end
); // end

export default getDocuments;