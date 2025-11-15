import { Hono } from "hono";
import getApplication from "./get/get-application";
import postApplication from "./post";

const application = new Hono();


application.get(
    "/",
    ...getApplication,
);

application.post(
    "/",
    ...postApplication,
);



export default application;