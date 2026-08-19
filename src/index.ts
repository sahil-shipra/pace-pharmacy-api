import { Hono } from "hono";
import { etag } from "hono/etag";
import { logger } from "hono/logger";
import { Scalar } from "@scalar/hono-api-reference";
import { openAPIRouteHandler } from "hono-openapi";
import { cors } from 'hono/cors'
import appRoutes from "./routes";
import { serveStatic } from 'hono/bun'
import { sentry } from "@sentry/hono/bun";

const app = new Hono();
app.use(
  sentry(app, {
    dsn: "https://290333ea5344af71afdd6e73888fd279@o4511936472088576.ingest.us.sentry.io/4511936747208704",
    dataCollection: {
      // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
      // https://docs.sentry.io/platforms/javascript/guides/hono/configuration/options/#dataCollection
      // userInfo: false,
      // httpBodies: [],
    },
    debug: true,
    shouldHandleError(error) {
      return true;
    },
  }),
);
app.use('/*', serveStatic({ root: './public/*' }))

app.use('/api/*', cors({
  origin: [
    'http://localhost:5001',
    'http://localhost:4001',
    'https://pace-pharmacy-form.vercel.app',
    'https://pace-pharmacy-admin.vercel.app',
    'https://intake.pacepharmacy.com',
    'https://admin.pacepharmacy.com',
    'http://intake.pacepharmacy.com',
    'http://admin.pacepharmacy.com',
    'http://localhost:4173'
  ],
  credentials: true,
}))

app.use(etag());
app.use(logger());

app.route("/api", appRoutes);

// Use the middleware to serve the Scalar API Reference at /scalar
app.get(
  "/openapi.json",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "Pace Pharmacy",
        version: "1.2.1",
        description: "",
      },
    },
  })
);

const allowDocs = process.env.ALLOW_API_DOCS === "true";

if (allowDocs) {
  app.get(
    "/docs",
    Scalar({
      url: "/openapi.json",
      theme: "purple",
      pageTitle: "Pace Pharmacy API.",
      defaultHttpClient: {
        targetKey: 'js',
        clientKey: 'axios',
      },
    })
  );
}

export default {
  port: 3000,
  idleTimeout: 60, // increase timeout (seconds)
  fetch: app.fetch,
}