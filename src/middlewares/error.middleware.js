export const errorHandler = (
    error,
    req,
    res,
    next
) => {
    let statusCode =
        error.statusCode || 500;

    let message =
        error.statusCode
            ? error.message
            : "Error interno del servidor";


    if (
        error instanceof SyntaxError &&
        error.status === 400 &&
        "body" in error
    ) {
        statusCode = 400;
        message =
            "El cuerpo de la solicitud contiene JSON inválido";
    }


    if (
        error.name === "ValidationError"
    ) {
        statusCode = 400;
        message =
            "Los datos enviados no son válidos";
    }


    if (
        error.name === "CastError"
    ) {
        statusCode = 400;
        message =
            "El identificador o dato enviado no es válido";
    }


    if (
        error.code === 11000
    ) {
        statusCode = 409;

        const duplicatedField =
            Object.keys(
                error.keyPattern || {}
            )[0];


        message = duplicatedField
            ? `Ya existe un registro con el campo ${duplicatedField}`
            : "El recurso ya existe";
    }


    res.status(statusCode).json({
        status: "error",
        message
    });
};