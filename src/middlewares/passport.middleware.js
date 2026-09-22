import passport from "passport";


export const authenticatePassport = (
    strategy,
    defaultMessage = "No autenticado",
    defaultStatusCode = 401,
    usePassportMessage = true
) => {
    return (req, res, next) => {
        passport.authenticate(
            strategy,
            {
                session: false
            },
            (error, user, info, status) => {
                if (error) {
                    return next(error);
                }

                if (!user) {
                    const message = usePassportMessage
                        ? info?.message || defaultMessage
                        : defaultMessage;

                    const statusCode = usePassportMessage
                        ? info?.statusCode || status || defaultStatusCode
                        : defaultStatusCode;

                    const authError = new Error(message);
                    authError.statusCode = statusCode;

                    return next(authError);
                }

                req.user = user;

                next();
            }
        )(req, res, next);
    };
};