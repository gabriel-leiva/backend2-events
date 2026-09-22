import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy } from "passport-jwt";

import {
    getUserByEmail,
    saveUser
} from "../repositories/users.repository.js";

import {
    createHash,
    isValidPassword
} from "../utils/hash.js";

import { config } from "./config.js";


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


const cookieExtractor = (req) => {
    if (req && req.cookies) {
        return req.cookies.currentUser || null;
    }

    return null;
};


passport.use(
    "register",
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
            passReqToCallback: true,
            badRequestMessage: "Faltan campos obligatorios"
        },
        async (req, email, password, done) => {
            try {
                const { first_name, last_name } = req.body ?? {};

                if (
                    typeof first_name !== "string" ||
                    typeof last_name !== "string" ||
                    typeof email !== "string" ||
                    typeof password !== "string" ||
                    !first_name.trim() ||
                    !last_name.trim() ||
                    !email.trim() ||
                    !password.trim()
                ) {
                    return done(null, false, {
                        message: "Faltan campos obligatorios",
                        statusCode: 400
                    });
                }

                if (!emailRegex.test(email.trim())) {
                    return done(null, false, {
                        message: "El email no es válido",
                        statusCode: 400
                    });
                }

                if (password.length < 8) {
                    return done(null, false, {
                        message: "La contraseña debe tener al menos 8 caracteres",
                        statusCode: 400
                    });
                }

                const normalizedEmail = email.trim().toLowerCase();

                const existingUser = await getUserByEmail(normalizedEmail);

                if (existingUser) {
                    return done(null, false, {
                        message: "El email ya está registrado",
                        statusCode: 409
                    });
                }

                const hashedPassword = await createHash(password);

                const newUser = await saveUser({
                    first_name: first_name.trim(),
                    last_name: last_name.trim(),
                    email: normalizedEmail,
                    password: hashedPassword,
                    role: "user"
                });

                return done(null, newUser);
            } catch (error) {
                return done(error);
            }
        }
    )
);


passport.use(
    "login",
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
            badRequestMessage: "Faltan campos obligatorios"
        },
        async (email, password, done) => {
            try {
                const normalizedEmail = email.trim().toLowerCase();

                const user = await getUserByEmail(normalizedEmail);

                if (!user) {
                    return done(null, false, {
                        message: "Credenciales inválidas",
                        statusCode: 401
                    });
                }

                const validPassword = await isValidPassword(
                    password,
                    user.password
                );

                if (!validPassword) {
                    return done(null, false, {
                        message: "Credenciales inválidas",
                        statusCode: 401
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);


passport.use(
    "current",
    new JwtStrategy(
        {
            jwtFromRequest: cookieExtractor,
            secretOrKey: config.jwtSecret
        },
        async (jwtPayload, done) => {
            try {
                const user = await getUserByEmail(jwtPayload.email);

                if (!user) {
                    return done(null, false, {
                        message: "No autenticado"
                    });
                }

                return done(null, {
                    id: user._id,
                    email: user.email,
                    role: user.role
                });
            } catch (error) {
                return done(error);
            }
        }
    )
);