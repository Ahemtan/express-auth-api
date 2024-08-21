import express from "express";
import config from "config";

import connect from "./utils/connect";
import logger from "./utils/logger";

const dotenv = require("dotenv").config();
const port = config.get<number>("port");

import routes from "./route";


const app = express();

app.listen(port, async () => {
  logger.info(`App is running on port ${port}`);

  await connect();

  routes(app);
});
