import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy } from "passport-jwt";

import {
    registerUserService,
    loginUserService,
    getCurrentSessionUserService
} from "../services/sessions.service.js";

import {
    config
} from "./config.js";


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
                const {
                    first_name,
                    last_name
                } = req.body ?? {};

                const user = await registerUserService({
                    first_name,
                    last_name,
                    email,
                    password
                });

                return done(null, user);
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
                const user = await loginUserService({
                    email,
                    password
                });

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
                const user =
                    await getCurrentSessionUserService(
                        jwtPayload.email
                    );

                return done(null, user);
            } catch (error) {
                if (error.statusCode === 401) {
                    return done(null, false, {
                        message: error.message,
                        statusCode: error.statusCode
                    });
                }

                return done(error);
            }
        }
    )
);