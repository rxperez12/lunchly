/** Express app for Lunchly. */

import express from "express";
import nunjucks from "nunjucks";
import { NotFoundError } from "./expressError.js";
import routes from "./routes.js";

const app = express();

// Parse body for urlencoded (traditional form) data
app.use(express.urlencoded());

nunjucks.configure("templates", {
  autoescape: true,
  express: app,
});

app.use(routes);

/** 404 handler: matches unmatched routes; raises NotFoundError. */
app.use(function (req, res, next) {
  throw new NotFoundError();
});

/** Error handler: logs stacktrace and renders error template. */
app.use(function (err, req, res, next) {
  const status = err.status || 500;
  const message = err.message;
  if (process.env.NODE_ENV !== "test") console.error(status, err.stack);
  return res.status(status).render("error.jinja", { err: { message, status } });
});

export default app;
