import {
    getAllUsers
} from "../repositories/users.repository.js";

import {
    UserDTO
} from "../dto/user.dto.js";


export const getAllUsersService = async () => {
    const users = await getAllUsers();

    return users.map(
        user => UserDTO.toPublicResponse(user)
    );
};