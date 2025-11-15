import { Hono } from "hono";
import patient from "./patient";
import authRoute, { authMiddleware } from "./auth";

const adminRoutes = new Hono();

adminRoutes.route("/auth", authRoute)
adminRoutes.use(authMiddleware)
adminRoutes.route("/patient", patient)

export default adminRoutes;