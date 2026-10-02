import nodemailer from "nodemailer";
import { config } from "./config.js";


export const transporter = nodemailer.createTransport({
    host: config.mailHost,
    port: Number(config.mailPort),
    secure: Number(config.mailPort) === 465,
    auth: {
        user: config.mailUser,
        pass: config.mailPass
    }
});