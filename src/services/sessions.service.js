import { getUserByEmail, saveUser } from "../repositories/users.repository.js";
import { createHash } from "../utils/hash.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerUser = async ({
    first_name,
    last_name,
    email,
    password
}) => {
    if (
        !first_name?.trim() ||
        !last_name?.trim() ||
        !email?.trim() ||
        !password
    ) {
        const error = new Error("Faltan campos obligatorios");
        error.statusCode = 400;
        throw error;
    }

    if (!emailRegex.test(email.trim())) {
        const error = new Error("El email no es válido");
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

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await getUserByEmail(normalizedEmail);

    if (existingUser) {
        const error = new Error("El email ya está registrado");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await createHash(password);

    const newUser = await saveUser({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "user"
    });

    return {
        id: newUser._id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        role: newUser.role
    };
};