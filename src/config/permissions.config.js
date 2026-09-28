export const permissions = {
    VIEW_PUBLISHED_EVENTS: [
        "user",
        "organizer",
        "admin"
    ],

    CREATE_EVENT: [
        "organizer",
        "admin"
    ],

    MODIFY_OWN_EVENT: [
        "organizer",
        "admin"
    ],

    MODIFY_ANY_EVENT: [
        "admin"
    ],

    VIEW_ALL_USERS: [
        "admin"
    ]
};