import { Hono } from "hono";
import getAllPatients from "./get/get-all-patients";
import updatePatientKrollStatus from "./patch/update-status";
import getPatient from "./get/get-patient";
import getPatientPdf from "./get/get-patient-pdf";

const krollRoutes = new Hono();

krollRoutes.get(
    "/patients",
    ...getAllPatients,
);

krollRoutes.get(
    "/patients/:id",
    ...getPatient,
);

// krollRoutes.get(
//     "/patients/pdf/:id",
//     ...getPatientPdf,
// );

krollRoutes.patch(
    "/kroll-status/:id",
    ...updatePatientKrollStatus,
);

export default krollRoutes;