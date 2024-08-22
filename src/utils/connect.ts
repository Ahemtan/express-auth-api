import mongoose from "mongoose";
import logger from "./logger";

async function connect() {
  const dbUri = process.env.MONGO_URI ?? "mongodb://localhost:27017/defaultdb";

  try {
    await mongoose.connect(dbUri);
    logger.info("Connected to database sucessfully.");
  } catch (error) {
    logger.error(`Cound not connect to database! ${error}`);
    process.exit(1);
  }
}

export default connect;
