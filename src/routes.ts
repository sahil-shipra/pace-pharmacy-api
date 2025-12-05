import { Hono } from "hono";
import account from "./controllers/account";
import application from "./controllers/application";
import adminRoutes from "./controllers/admin";

const appRoutes = new Hono();

appRoutes.get("/v", (c) => {
    return c.json({
        version: "1.0.3"
    })
})
appRoutes.route("/account", account);
appRoutes.route("/application", application);

appRoutes.route("/admin", adminRoutes);

export default appRoutes;