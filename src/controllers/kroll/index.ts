import { Hono } from "hono";
import getAllPatients from "./get/get-all-patients";
import updatePatientKrollStatus from "./patch/update-status";
import getPatient from "./get/get-patient";
import getPatientPdf from "./get/get-patient-pdf";
import getMdApprovalEmail from "./get/get-md-approval-email";
import getDocuments from "./get/get-documents";
import apiKeyMiddleware from "@/middleware/api-key-middleware";

const krollRoutes = new Hono();

krollRoutes.use("/*", apiKeyMiddleware);

krollRoutes.get(
    "/patients",
    ...getAllPatients,
);

krollRoutes.get(
    "/patients/:id",
    ...getPatient,
);

krollRoutes.get(
    "/patients/documents/:id",
    ...getDocuments,
);

krollRoutes.get(
    "/patients/pdf/:id",
    ...getPatientPdf,
);

krollRoutes.get(
    "/md-approval-email/pdf/:id",
    ...getMdApprovalEmail,
);

krollRoutes.patch(
    "/kroll-status/:id",
    ...updatePatientKrollStatus,
);

export default krollRoutes;