import { describeRoute, validator } from "hono-openapi";
import { createFactory } from "hono/factory";
import { createSuccessResponse } from "@/controllers/_schemas";
import { getAllAccounts } from "./get-account";

const factory = createFactory();

const getAllPatients = factory.createHandlers(
    describeRoute({
        tags: ["Kroll"],
        summary: "Get all patients",
        description: "Get all patients who are pending a Kroll update.",
        responses: {
            200: {
                description: "Successful response",
                content: {
                    "application/json": {},
                },
            },
        },
    }),
    async (c) => {
        const patients = await getAllAccounts();

        return c.json(
            createSuccessResponse({
                count: patients.length,
                patients,
            })
        );
    }
);

export default getAllPatients;
