import { registerUser } from "../services/sessions.service.js";

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