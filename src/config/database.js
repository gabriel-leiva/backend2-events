import mongoose from "mongoose";
import { config } from "./config.js";

export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUrl);
        console.log("MongoDB conectado correctamente");
    } catch (error) {
        console.error("Error al conectar con MongoDB:", error.message);
        process.exit(1);
    }
};