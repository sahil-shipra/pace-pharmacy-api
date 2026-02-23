import { describeRoute } from "hono-openapi";
import { createFactory } from "hono/factory";
import { createSuccessResponse } from "@/controllers/_schemas";
import { getAllAccounts } from "./get-account";

const factory = createFactory();

const getKrollCompletedPatients = factory.createHandlers(
    describeRoute({
        tags: ["Kroll"],
        summary: "Get Kroll Completed Patients",
        description: "Get all patients who are Completed a Kroll status.",
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
        const patients = await getAllAccounts(undefined, "complete");

        return c.json(
            createSuccessResponse({
                count: patients.length,
                patients,
            })
        );
    }
);

export default getKrollCompletedPatients;
