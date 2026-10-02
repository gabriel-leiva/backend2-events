import { UserModel } from "../models/User.js";

export const findUserByEmail = async (email) => {
    return await UserModel.findOne({ email });
};

export const createUser = async (userData) => {
    return await UserModel.create(userData);
};

export const findAllUsers = async () => {
    return await UserModel.find().select("-password");
};

export const findUserById = async (userId) => {
    return await UserModel.findById(userId);
};