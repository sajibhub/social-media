import mongoose from "mongoose";

const DATABASE = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connection established");
  } catch (error) {
    console.log("Database connection failed");
  }
};

export default DATABASE;
