import mongoose from "mongoose";

async function connect() {

  const dbUri = process.env.MONGO_URI ?? 'mongodb://localhost:27017/defaultdb'

  try {
    console.log('Connected to database succesfully.')
    return mongoose.connect(dbUri);
  } catch (error) {
    console.log("Cound not connect to database!");
    process.exit(1);
  }
}

export default connect;
