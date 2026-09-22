import {
    registerUser,
    loginUser
} from "../services/sessions.service.js";

import { generateToken } from "../utils/jwt.js";
import { config } from "../config/config.js";


export const getSessionsStatus = (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Estructura de sessions disponible"
    });
};


export const register = async (req, res, next) => {
    try {
        const user = await registerUser(req.body);

        res.status(201).json({
            status: "success",
            payload: user
        });
    } catch (error) {
        next(error);
    }
};


export const login = async (req, res, next) => {
    try {
        const user = await loginUser(req.body);

        const token = generateToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        res.cookie("currentUser", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 3600000,
            secure: config.nodeEnv === "production"
        });

        res.status(200).json({
            status: "success",
            message: "Login correcto"
        });
    } catch (error) {
        next(error);
    }
};

export const current = (req, res) => {
    res.status(200).json({
        status: "success",
        payload: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role
        }
    });
};

export const logout = (req, res) => {
    res.clearCookie("currentUser", {
        httpOnly: true,
        sameSite: "lax",
        secure: config.nodeEnv === "production"
    });

    res.status(200).json({
        status: "success",
        message: "Sesión cerrada"
    });
};