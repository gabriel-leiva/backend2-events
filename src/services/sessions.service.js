import {
    getUserByEmail,
    saveUser
} from "../repositories/users.repository.js";

import {
    createHash,
    isValidPassword
} from "../utils/hash.js";

import {
    generateToken
} from "../utils/jwt.js";

import {
    UserDTO
} from "../dto/user.dto.js";


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


export const registerUserService = async ({
    first_name,
    last_name,
    email,
    password
}) => {
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
        const error = new Error(
            "Faltan campos obligatorios"
        );

        error.statusCode = 400;

        throw error;
    }


    if (!emailRegex.test(email.trim())) {
        const error = new Error(
            "El email no es válido"
        );

        error.statusCode = 400;

        throw error;
    }


    if (password.length < 8) {
        const error = new Error(
            "La contraseña debe tener al menos 8 caracteres"
        );

        error.statusCode = 400;

        throw error;
    }


    const normalizedEmail = email
        .trim()
        .toLowerCase();


    const existingUser = await getUserByEmail(
        normalizedEmail
    );


    if (existingUser) {
        const error = new Error(
            "El email ya está registrado"
        );

        error.statusCode = 409;

        throw error;
    }


    const hashedPassword = await createHash(
        password
    );


    const newUser = await saveUser({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "user"
    });


    return newUser;
};


export const loginUserService = async ({
    email,
    password
}) => {
    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password.trim()
    ) {
        const error = new Error(
            "Faltan campos obligatorios"
        );

        error.statusCode = 400;

        throw error;
    }


    const normalizedEmail = email
        .trim()
        .toLowerCase();


    const user = await getUserByEmail(
        normalizedEmail
    );


    if (!user) {
        const error = new Error(
            "Credenciales inválidas"
        );

        error.statusCode = 401;

        throw error;
    }


    const validPassword = await isValidPassword(
        password,
        user.password
    );


    if (!validPassword) {
        const error = new Error(
            "Credenciales inválidas"
        );

        error.statusCode = 401;

        throw error;
    }


    return user;
};


export const getCurrentSessionUserService = async (
    email
) => {
    const user = await getUserByEmail(email);

    if (!user) {
        const error = new Error(
            "No autenticado"
        );

        error.statusCode = 401;

        throw error;
    }

    return {
        id: user._id,
        email: user.email,
        role: user.role
    };
};


export const getRegisterResponseService = (user) => {
    return UserDTO.toRegisterResponse(user);
};


export const createSessionTokenService = (user) => {
    return generateToken({
        id: user._id ?? user.id,
        email: user.email,
        role: user.role
    });
};


export const getCurrentUserResponseService = (user) => {
    return UserDTO.toCurrentResponse(user);
};