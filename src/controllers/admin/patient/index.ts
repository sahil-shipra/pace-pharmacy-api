import { Hono } from "hono";
import patientIntakes from "./get/patient-intakes";

const patient = new Hono();

patient.get(
    "/",
    ...patientIntakes,
);

export default patient;
