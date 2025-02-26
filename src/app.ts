require("dotenv").config();

import express from "express";
import config from "config";
var cookieParser = require('cookie-parser')

import logger from "./utils/logger";

import router from "./routes";
import deserializeUser from "./middleware/deserializeUser";


const app = express();


app.use(express.json());

app.use(cookieParser());
app.use(deserializeUser);

app.use(router);

const port = config.get<number>("port");

app.listen(port, async () => {
  logger.info(`App is running on port ${port}`);
});
