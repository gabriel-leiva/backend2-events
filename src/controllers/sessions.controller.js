import { generateToken } from "../utils/jwt.js";
import { config } from "../config/config.js";


export const getSessionsStatus = (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Estructura de sessions disponible"
    });
};


export const register = (req, res) => {
    res.status(201).json({
        status: "success",
        payload: {
            id: req.user._id,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            role: req.user.role
        }
    });
};


export const login = (req, res) => {
    const token = generateToken({
        id: req.user._id,
        email: req.user.email,
        role: req.user.role
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