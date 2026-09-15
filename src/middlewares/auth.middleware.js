import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
    const token = req.cookies.currentUser;

    if (!token) {
        const error = new Error("No autenticado");
        error.statusCode = 401;
        return next(error);
    }

    try {
        const decoded = verifyToken(token);

        req.user = decoded;

        next();
    } catch (error) {
        const authError = new Error("No autenticado");
        authError.statusCode = 401;
        next(authError);
    }
};