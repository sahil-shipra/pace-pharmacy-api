
import { Hono } from "hono";
import patientsData from "./get/patient-data";
const exportPatientData = new Hono();

exportPatientData.get(
    "/",
    ...patientsData,
);

export default exportPatientData;