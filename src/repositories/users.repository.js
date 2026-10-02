import {
    findUserByEmail,
    createUser,
    findAllUsers,
    findUserById
} from "../dao/users.dao.js";

export const getUserByEmail = async (email) => {
    return await findUserByEmail(email);
};

export const saveUser = async (userData) => {
    return await createUser(userData);
};

export const getAllUsers = async () => {
    return await findAllUsers();
};

export const getUserById = async (userId) => {
    return await findUserById(userId);
};