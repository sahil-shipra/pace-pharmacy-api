import { Hono } from "hono";
import { etag } from "hono/etag";
import { logger } from "hono/logger";
import { Scalar } from "@scalar/hono-api-reference";
import { openAPIRouteHandler } from "hono-openapi";
import { cors } from 'hono/cors'
import appRoutes from "./routes";
import { serveStatic } from 'hono/bun'

const app = new Hono();

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
app.use(etag(), logger());

app.route("/api", appRoutes);

// Use the middleware to serve the Scalar API Reference at /scalar
app.get(
  "/openapi.json",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "Pace Pharmacy",
        version: "1.0.5",
        description: "",
      },
    },
  })
);

if (process.env.NODE_ENV === 'development') {
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