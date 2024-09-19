require("dotenv").config();

import express from "express";
import config from "config";

import connect from "./utils/connect";
import logger from "./utils/logger";

import router from "./routes";


const app = express();

app.use(express.json());

app.use(router);

const port = config.get<number>("port");

app.listen(port, async () => {
  logger.info(`App is running on port ${port}`);

  await connect();

});
