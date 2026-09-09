export const errorHandler = (error, req, res, next) => {
    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
        status: "error",
        message: error.statusCode
            ? error.message
            : "Error interno del servidor"
    });
};