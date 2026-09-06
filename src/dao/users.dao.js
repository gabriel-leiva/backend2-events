import { UserModel } from "../models/User.js";

export const findUserByEmail = async (email) => {
    return await UserModel.findOne({ email });
};

export const createUser = async (userData) => {
    return await UserModel.create(userData);
};