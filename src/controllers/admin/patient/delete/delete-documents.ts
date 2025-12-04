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
    id: z.string().min(1, "Document id is required"),
});

const factory = createFactory();
const deleteDocuments = factory.createHandlers(
    authMiddleware,
    describeRoute({
        tags: ["Patient"],
        summary: "Remove Documents",
        description: "",
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
            const { id } = c.req.valid("param");

            const docs = await db
                .select()
                .from(documentsTable)
                .where(eq(documentsTable.id, id));

            await db.delete(documentsTable)
                .where(eq(documentsTable.id, id));

            const BucketName = process.env.BUCKET_NAME!;

            docs.map(async (doc: any) => {
                const path = doc.path;
                await supabase.storage
                    .from(BucketName)
                    .remove(path);
            });

            return c.json(
                createSuccessResponse({
                    message: "Document Delete successfully.",
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

export default deleteDocuments;