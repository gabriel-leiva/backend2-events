import {
    getRegisterResponseService,
    createSessionTokenService,
    getCurrentUserResponseService
} from "../services/sessions.service.js";

import {
    config
} from "../config/config.js";


export const getSessionsStatus = (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Estructura de sessions disponible"
    });
};


export const register = (req, res) => {
    const user = getRegisterResponseService(
        req.user
    );

    res.status(201).json({
        status: "success",
        payload: user
    });
};


export const login = (req, res) => {
    const token = createSessionTokenService(
        req.user
    );

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
    const user = getCurrentUserResponseService(
        req.user
    );

    res.status(200).json({
        status: "success",
        payload: user
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