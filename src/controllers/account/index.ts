import { Hono } from "hono";
import postAccount from "./post";
import resendAuthEmail from "../admin/patient/post/resend-auth-email";

const account = new Hono();

account.post(
    "/",
    ...postAccount,
);

export default account;