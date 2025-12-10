import { Hono } from "hono";
import patient from "./patient";
import authRoute, { authMiddleware } from "./auth";
import exportPatientData from "./export";

const adminRoutes = new Hono();

adminRoutes.route("/auth", authRoute)
adminRoutes.use(authMiddleware)
adminRoutes.route("/patient", patient)
adminRoutes.route("/export", exportPatientData)

export default adminRoutes;