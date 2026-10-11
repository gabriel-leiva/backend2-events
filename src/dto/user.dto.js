export class UserDTO {

    static toPublicResponse(userRaw) {
        if (!userRaw) {
            return null;
        }

        const user =
            typeof userRaw.toObject === "function"
                ? userRaw.toObject()
                : { ...userRaw };

        const {
            password,
            ...publicUser
        } = user;

        return publicUser;
    }


    static toRegisterResponse(userRaw) {
        if (!userRaw) {
            return null;
        }

        return {
            id: userRaw._id ?? userRaw.id,
            first_name: userRaw.first_name,
            last_name: userRaw.last_name,
            email: userRaw.email,
            role: userRaw.role
        };
    }


    static toCurrentResponse(userRaw) {
        if (!userRaw) {
            return null;
        }

        return {
            id: userRaw._id ?? userRaw.id,
            email: userRaw.email,
            role: userRaw.role
        };
    }
}