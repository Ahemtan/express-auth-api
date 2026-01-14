require("dotenv").config();

import express from "express";
import cookieParser from "cookie-parser";

import logger from "./utils/logger";

import router from "./routes";
import deserializeUser from "./middleware/deserializeUser";

import cors from "cors";
import { csrfMiddleware } from "./middleware/csrf";
import { setupSwagger } from "./swagger";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.APP_ORIGIN,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(csrfMiddleware);
app.use(deserializeUser);

app.use(router);

if (process.env.NODE_ENV !== "production") {
  setupSwagger(app);
}

const port = process.env.PORT || 4000;

app.listen(port, async () => {
  logger.info(`App is running on port ${port}`);
  if (process.env.NODE_ENV !== "production") {
    logger.info(`Swagger docs available at http://localhost:${port}/swagger`);
  }
});
