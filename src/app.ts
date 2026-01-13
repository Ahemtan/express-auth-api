require("dotenv").config();

import express from "express";
import config from "config";
import cookieParser from "cookie-parser";

import logger from "./utils/logger";

import router from "./routes";
import deserializeUser from "./middleware/deserializeUser";

import cors from "cors";
import { csrfMiddleware } from "./middleware/csrf";

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

const port = config.get<number>("port");

app.listen(port, async () => {
  logger.info(`App is running on port ${process.env.ORIGIN_URL}`);
});
