import {
    findUserByEmail,
    createUser
} from "../dao/users.dao.js";

export const getUserByEmail = async (email) => {
    return await findUserByEmail(email);
};

export const saveUser = async (userData) => {
    return await createUser(userData);
};