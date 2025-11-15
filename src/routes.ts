import { Hono } from "hono";
import account from "./controllers/account";
import application from "./controllers/application";
import adminRoutes from "./controllers/admin";

const appRoutes = new Hono();

appRoutes.route("/account", account);
appRoutes.route("/application", application);

appRoutes.route("/admin", adminRoutes);

export default appRoutes;