import { Hono } from "hono";
import patientIntakes from "./get/patient-intakes";
import resendAuthEmail from "./post/resend-auth-email";
import getPatient from "./get/patient";
import updateAccountStatus from "./put/update-account-status";
import updatePatient from "./patch/update-patient";
import uploadDocuments from "./post/upload-documents";
import getDocuments from "./get/get-documents";
import deleteDocuments from "./delete/delete-documents";

const patient = new Hono();

patient.get(
    "/",
    ...patientIntakes,
);

patient.get(
    "/:id",
    ...getPatient,
);

patient.patch(
    "/:id",
    ...updatePatient,
);

patient.post(
    "/resend-auth-email",
    ...resendAuthEmail,
);

patient.put(
    "/update-account-status",
    ...updateAccountStatus,
);

patient.put(
    "/upload-documents/:code",
    ...uploadDocuments,
);

patient.get(
    "/documents/:code",
    ...getDocuments,
);

patient.delete(
    "/documents/:id",
    ...deleteDocuments,
);

export default patient;
