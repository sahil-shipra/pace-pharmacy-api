import { Hono } from "hono";
import patientIntakes from "./get/patient-intakes";
import resendAuthEmail from "./post/resend-auth-email";
import getPatient from "./get/patient";

const patient = new Hono();

patient.get(
    "/",
    ...patientIntakes,
);


patient.get(
    "/:id",
    ...getPatient,
);

patient.post(
    "/resend-auth-email",
    ...resendAuthEmail,
);


export default patient;
