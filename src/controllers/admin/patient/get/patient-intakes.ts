import { describeRoute, validator } from "hono-openapi";
import { createFactory } from "hono/factory";
import { getPaginatedPatientIntakes, getPatientIntakeStatistics } from "./get-account";
import { createSuccessResponse } from "@/controllers/_schemas";
import z from "zod";

const factory = createFactory();

const requestSchema = z.object({
    preferredLocation: z.enum(["all", 'leaside', "downtown"]).default('all'),
    authStatus: z.enum(["all", 'pending', "completed"]).default('all'),
    page: z.string().optional(),
    pageSize: z.string().optional(),
});


const patientIntakes = factory.createHandlers(
    describeRoute({
        tags: ["Patient"],
        summary: "Patient Intakes",
        description: "Get paginated list of patient intakes",
        responses: {
            200: {
                description: "Successful response",
                content: {
                    "application/json": {},
                },
            },
        },
    }),
    validator("query", requestSchema),
    async (c) => {
        const { preferredLocation, authStatus } = c.req.valid("query");
        const page = parseInt(c.req.query("page") || "1", 10);
        const pageSize = parseInt(c.req.query("pageSize") || "15", 10);

        const [result, statistics] = await Promise.all([
            getPaginatedPatientIntakes(page, pageSize, preferredLocation, authStatus),
            getPatientIntakeStatistics(preferredLocation, authStatus),
        ]);

        return c.json(createSuccessResponse({
            statistics,
            accounts: result.data,
            pagination: result.pagination,
        }));
    }
);

export default patientIntakes;
