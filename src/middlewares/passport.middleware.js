import passport from "passport";


export const authenticatePassport = (
    strategy,
    defaultMessage = "No autenticado",
    defaultStatusCode = 401
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
                    const authError = new Error(
                        info?.message || defaultMessage
                    );

                    authError.statusCode =
                        info?.statusCode ||
                        status ||
                        defaultStatusCode;

                    return next(authError);
                }

                req.user = user;

                next();
            }
        )(req, res, next);
    };
};