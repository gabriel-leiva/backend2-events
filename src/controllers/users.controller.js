import {
    getAllUsers
} from "../repositories/users.repository.js";


export const getUsers = async (req, res, next) => {
    try {
        const users = await getAllUsers();

        res.status(200).json({
            status: "success",
            payload: users
        });
    } catch (error) {
        next(error);
    }
};