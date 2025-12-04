import { createFactory } from "hono/factory";
import z from "zod";
import { authMiddleware } from "../../auth";
import { describeRoute, validator } from "hono-openapi";
import { fileUpload } from "@/controllers/account/utils";
import { createErrorResponse, createSuccessResponse } from "@/controllers/_schemas";

const requestSchema = z.object({
    documents: z.any(),
})

const paramSchema = z.object({
    code: z.string().min(1, "Reference Code is required")
})

const factory = createFactory();
const uploadDocuments = factory.createHandlers(
    authMiddleware,
    describeRoute({
        tags: ["Patient"],
        summary: "Upload Documents",
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
    validator("form", requestSchema),
    validator("param", paramSchema),
    async (c) => {
        try {
            const formData = await c.req.formData();
            const files = formData.getAll('documents');
            const { code } = c.req.valid("param");
            console.log('code', code)
            console.log('files', files)
            
            if (files && files.length) {
                await fileUpload(formData, code);
            }

            return c.json(createSuccessResponse({
                message: "upload "
            }))
        } catch (error: any) {
            return c.json(createErrorResponse(error.cause, error.message))
        }
    } //end
) // end 


export default uploadDocuments;