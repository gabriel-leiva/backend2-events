import {
    getAllUsersService
} from "../services/users.service.js";


export const getUsers = async (req, res, next) => {
    try {
        const users = await getAllUsersService();

        res.status(200).json({
            status: "success",
            payload: users
        });
    } catch (error) {
        next(error);
    }
};