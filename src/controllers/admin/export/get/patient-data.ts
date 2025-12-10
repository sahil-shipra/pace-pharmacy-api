import { describeRoute } from "hono-openapi";
import { createFactory } from "hono/factory";
import { createSuccessResponse } from "@/controllers/_schemas";
import { getAllAccounts } from "./get-account";

const factory = createFactory();

const patientsData = factory.createHandlers(
    describeRoute({
        tags: ["Export"],
        summary: "Export All Patients",
        description: "Get list of patient intakes",
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
                patients,
            })
        );
    }
);

export default patientsData;
