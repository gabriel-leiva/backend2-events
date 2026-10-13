import test, {
    before,
    after
} from "node:test";

import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";

import {
    MongoMemoryReplSet
} from "mongodb-memory-server";


let mongoReplSet;
let app;
let transporter;

let saveUser;
let createHash;

let sentEmails = 0;


const createRoleFixture = async (
    userData,
    role
) => {
    const hashedPassword =
        await createHash(
            userData.password
        );

    return await saveUser({
        first_name:
            userData.first_name,
        last_name:
            userData.last_name,
        email:
            userData.email,
        password:
            hashedPassword,
        role
    });
};


before(async () => {
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "1h";

    process.env.MAIL_HOST = "localhost";
    process.env.MAIL_PORT = "2525";
    process.env.MAIL_USER = "test";
    process.env.MAIL_PASS = "test";
    process.env.MAIL_FROM =
        "test@example.com";


    mongoReplSet =
        await MongoMemoryReplSet.create({
            replSet: {
                count: 1
            }
        });


    await mongoose.connect(
        mongoReplSet.getUri()
    );


    const appModule = await import(
        "../app.js"
    );

    app = appModule.default;


    const usersRepositoryModule =
        await import(
            "../repositories/users.repository.js"
        );

    saveUser =
        usersRepositoryModule.saveUser;


    const hashModule = await import(
        "../utils/hash.js"
    );

    createHash =
        hashModule.createHash;


    const mailerModule = await import(
        "../config/mailer.config.js"
    );

    transporter =
        mailerModule.transporter;


    transporter.sendMail = async () => {
        sentEmails += 1;

        return {
            messageId: "test-email"
        };
    };
});


after(async () => {
    await mongoose.disconnect();

    if (mongoReplSet) {
        await mongoReplSet.stop();
    }
});


test(
    "flujo completo final de usuarios, eventos y tickets",
    async (t) => {

        const userAgent =
            request.agent(app);

        const secondUserAgent =
            request.agent(app);

        const organizerAgent =
            request.agent(app);

        const secondOrganizerAgent =
            request.agent(app);

        const adminAgent =
            request.agent(app);


        const userData = {
            first_name: "Usuario",
            last_name: "Test",
            email: "user.test@example.com",
            password: "Test12345"
        };


        const secondUserData = {
            first_name: "Usuario",
            last_name: "Segundo",
            email:
                "second.user.test@example.com",
            password: "Test12345"
        };


        const organizerData = {
            first_name: "Organizer",
            last_name: "Principal",
            email:
                "organizer.test@example.com",
            password: "Test12345"
        };


        const secondOrganizerData = {
            first_name: "Organizer",
            last_name: "Secundario",
            email:
                "second.organizer.test@example.com",
            password: "Test12345"
        };


        const adminData = {
            first_name: "Admin",
            last_name: "Test",
            email: "admin.test@example.com",
            password: "Test12345"
        };


        let eventId;
        let ticketId;

        let foreignEventId;

        let capacityEventId;
        let capacityTicketId;


        await t.test(
            "registro público ignora role y crea user",
            async () => {
                const response =
                    await userAgent
                        .post(
                            "/api/sessions/register"
                        )
                        .send({
                            ...userData,
                            role: "admin"
                        })
                        .expect(201);


                assert.equal(
                    response.body.status,
                    "success"
                );


                assert.equal(
                    response.body.payload.email,
                    userData.email
                );


                assert.equal(
                    response.body.payload.role,
                    "user"
                );


                assert.equal(
                    response.body.payload.password,
                    undefined
                );

                assert.equal(
                    sentEmails,
                    1
                );
            }
        );


        await t.test(
            "email duplicado devuelve 409",
            async () => {
                await request(app)
                    .post(
                        "/api/sessions/register"
                    )
                    .send(userData)
                    .expect(409);
            }
        );


        await t.test(
            "se crean fixtures organizer, segundo organizer y admin",
            async () => {
                const organizer =
                    await createRoleFixture(
                        organizerData,
                        "organizer"
                    );


                const secondOrganizer =
                    await createRoleFixture(
                        secondOrganizerData,
                        "organizer"
                    );


                const admin =
                    await createRoleFixture(
                        adminData,
                        "admin"
                    );


                assert.equal(
                    organizer.role,
                    "organizer"
                );


                assert.equal(
                    secondOrganizer.role,
                    "organizer"
                );


                assert.equal(
                    admin.role,
                    "admin"
                );
            }
        );


        await t.test(
            "login de usuario",
            async () => {
                await userAgent
                    .post(
                        "/api/sessions/login"
                    )
                    .send({
                        email:
                            userData.email,
                        password:
                            userData.password
                    })
                    .expect(200);
            }
        );


        await t.test(
            "current no expone password",
            async () => {
                const response =
                    await userAgent
                        .get(
                            "/api/sessions/current"
                        )
                        .expect(200);


                assert.equal(
                    response.body.payload.email,
                    userData.email
                );


                assert.equal(
                    response.body.payload.password,
                    undefined
                );
            }
        );


        await t.test(
            "logout elimina la sesión",
            async () => {
                await userAgent
                    .post(
                        "/api/sessions/logout"
                    )
                    .expect(200);
            }
        );


        await t.test(
            "current después de logout devuelve 401",
            async () => {
                await userAgent
                    .get(
                        "/api/sessions/current"
                    )
                    .expect(401);
            }
        );


        await t.test(
            "usuario vuelve a iniciar sesión",
            async () => {
                await userAgent
                    .post(
                        "/api/sessions/login"
                    )
                    .send({
                        email:
                            userData.email,
                        password:
                            userData.password
                    })
                    .expect(200);
            }
        );


        await t.test(
            "user no puede crear eventos",
            async () => {
                await userAgent
                    .post(
                        "/api/events"
                    )
                    .send({
                        title:
                            "Evento prohibido",
                        description:
                            "Test",
                        category:
                            "Test",
                        date:
                            new Date(
                                Date.now() +
                                86400000
                            ).toISOString(),
                        location:
                            "Mar del Plata",
                        capacity: 10,
                        price: 0
                    })
                    .expect(403);
            }
        );


        await t.test(
            "login del organizer",
            async () => {
                await organizerAgent
                    .post(
                        "/api/sessions/login"
                    )
                    .send({
                        email:
                            organizerData.email,
                        password:
                            organizerData.password
                    })
                    .expect(200);
            }
        );


        await t.test(
            "login del segundo organizer",
            async () => {
                await secondOrganizerAgent
                    .post(
                        "/api/sessions/login"
                    )
                    .send({
                        email:
                            secondOrganizerData.email,
                        password:
                            secondOrganizerData.password
                    })
                    .expect(200);
            }
        );


        await t.test(
            "login del admin",
            async () => {
                await adminAgent
                    .post(
                        "/api/sessions/login"
                    )
                    .send({
                        email:
                            adminData.email,
                        password:
                            adminData.password
                    })
                    .expect(200);
            }
        );


        await t.test(
            "organizer crea evento",
            async () => {
                const response =
                    await organizerAgent
                        .post(
                            "/api/events"
                        )
                        .send({
                            title:
                                "Evento integración",
                            description:
                                "Evento para pruebas",
                            category:
                                "Tecnología",
                            date:
                                new Date(
                                    Date.now() +
                                    86400000 * 30
                                ).toISOString(),
                            location:
                                "Mar del Plata",
                            capacity: 20,
                            price: 1000
                        })
                        .expect(201);


                eventId =
                    response.body.payload.id;


                assert.ok(eventId);
            }
        );


        await t.test(
            "organizer publica evento",
            async () => {
                const response =
                    await organizerAgent
                        .patch(
                            `/api/events/${eventId}/status`
                        )
                        .send({
                            status: "published"
                        })
                        .expect(200);


                assert.equal(
                    response.body.payload.status,
                    "published"
                );
            }
        );


        await t.test(
            "respuesta de evento no contiene password",
            async () => {
                const response =
                    await request(app)
                        .get(
                            `/api/events/${eventId}`
                        )
                        .expect(200);


                assert.equal(
                    JSON.stringify(
                        response.body
                    ).includes(
                        "\"password\""
                    ),
                    false
                );
            }
        );


        await t.test(
            "usuario se inscribe y recibe ticket",
            async () => {
                const response =
                    await userAgent
                        .post(
                            `/api/events/${eventId}/tickets`
                        )
                        .send({
                            quantity: 1
                        })
                        .expect(201);


                ticketId =
                    response.body.payload.id;


                assert.ok(ticketId);


                assert.equal(
                    response.body.payload.status,
                    "confirmed"
                );


                assert.equal(
                    JSON.stringify(
                        response.body
                    ).includes(
                        "\"password\""
                    ),
                    false
                );
            }
        );


        await t.test(
            "inscripción duplicada devuelve 409",
            async () => {
                await userAgent
                    .post(
                        `/api/events/${eventId}/tickets`
                    )
                    .send({
                        quantity: 1
                    })
                    .expect(409);
            }
        );


        await t.test(
            "usuario consulta sus tickets",
            async () => {
                const response =
                    await userAgent
                        .get(
                            "/api/tickets/my-tickets"
                        )
                        .expect(200);


                assert.equal(
                    response.body.payload.length,
                    1
                );


                assert.equal(
                    response.body
                        .payload[0]
                        .status,
                    "confirmed"
                );


                assert.equal(
                    JSON.stringify(
                        response.body
                    ).includes(
                        "\"password\""
                    ),
                    false
                );
            }
        );


        await t.test(
            "populate de usuario no expone password",
            async () => {
                const response =
                    await organizerAgent
                        .get(
                            `/api/events/${eventId}/tickets`
                        )
                        .expect(200);


                assert.equal(
                    response.body.payload.length,
                    1
                );


                assert.equal(
                    response.body
                        .payload[0]
                        .user
                        .password,
                    undefined
                );


                assert.deepEqual(
                    Object.keys(
                        response.body
                            .payload[0]
                            .user
                    ).sort(),
                    [
                        "id",
                        "email",
                        "first_name",
                        "last_name"
                    ].sort()
                );
            }
        );


        await t.test(
            "usuario cancela su ticket",
            async () => {
                const response =
                    await userAgent
                        .patch(
                            `/api/tickets/${ticketId}/cancel`
                        )
                        .expect(200);


                assert.equal(
                    response.body.payload.status,
                    "cancelled"
                );


                assert.ok(
                    response.body
                        .payload
                        .cancelledAt
                );
            }
        );


        await t.test(
            "segundo organizer crea evento propio",
            async () => {
                const response =
                    await secondOrganizerAgent
                        .post(
                            "/api/events"
                        )
                        .send({
                            title:
                                "Evento de otro organizer",
                            description:
                                "Prueba de permisos",
                            category:
                                "Test",
                            date:
                                new Date(
                                    Date.now() +
                                    86400000 * 40
                                ).toISOString(),
                            location:
                                "Mar del Plata",
                            capacity: 10,
                            price: 0
                        })
                        .expect(201);


                foreignEventId =
                    response.body.payload.id;


                assert.ok(
                    foreignEventId
                );
            }
        );


        await t.test(
            "organizer no puede modificar evento ajeno",
            async () => {
                await organizerAgent
                    .put(
                        `/api/events/${foreignEventId}`
                    )
                    .send({
                        title:
                            "Modificación prohibida"
                    })
                    .expect(403);
            }
        );


        await t.test(
            "admin modifica evento de otro organizer",
            async () => {
                const response =
                    await adminAgent
                        .put(
                            `/api/events/${foreignEventId}`
                        )
                        .send({
                            title:
                                "Evento modificado por admin"
                        })
                        .expect(200);


                assert.equal(
                    response.body.payload.title,
                    "Evento modificado por admin"
                );
            }
        );


        await t.test(
            "se registra segundo usuario",
            async () => {
                const response =
                    await secondUserAgent
                        .post(
                            "/api/sessions/register"
                        )
                        .send(
                            secondUserData
                        )
                        .expect(201);


                assert.equal(
                    response.body.payload.role,
                    "user"
                );
                assert.equal(
                    sentEmails,
                    4
                );
            }
        );


        await t.test(
            "login del segundo usuario",
            async () => {
                await secondUserAgent
                    .post(
                        "/api/sessions/login"
                    )
                    .send({
                        email:
                            secondUserData.email,
                        password:
                            secondUserData.password
                    })
                    .expect(200);
            }
        );


        await t.test(
            "organizer crea evento con un solo cupo",
            async () => {
                const response =
                    await organizerAgent
                        .post(
                            "/api/events"
                        )
                        .send({
                            title:
                                "Evento cupo único",
                            description:
                                "Prueba de liberación de cupo",
                            category:
                                "Test",
                            date:
                                new Date(
                                    Date.now() +
                                    86400000 * 50
                                ).toISOString(),
                            location:
                                "Mar del Plata",
                            capacity: 1,
                            price: 0
                        })
                        .expect(201);


                capacityEventId =
                    response.body.payload.id;


                assert.ok(
                    capacityEventId
                );
            }
        );


        await t.test(
            "organizer publica evento de cupo único",
            async () => {
                await organizerAgent
                    .patch(
                        `/api/events/${capacityEventId}/status`
                    )
                    .send({
                        status: "published"
                    })
                    .expect(200);
            }
        );


        await t.test(
            "primer usuario ocupa el último cupo",
            async () => {
                const response =
                    await userAgent
                        .post(
                            `/api/events/${capacityEventId}/tickets`
                        )
                        .send({
                            quantity: 1
                        })
                        .expect(201);


                capacityTicketId =
                    response.body.payload.id;


                assert.ok(
                    capacityTicketId
                );
            }
        );


        await t.test(
            "segundo usuario recibe 409 cuando no hay cupo",
            async () => {
                const response =
                    await secondUserAgent
                        .post(
                            `/api/events/${capacityEventId}/tickets`
                        )
                        .send({
                            quantity: 1
                        })
                        .expect(409);


                assert.equal(
                    response.body.message,
                    "No hay cupos suficientes disponibles"
                );
            }
        );


        await t.test(
            "primer usuario cancela y libera el cupo",
            async () => {
                const response =
                    await userAgent
                        .patch(
                            `/api/tickets/${capacityTicketId}/cancel`
                        )
                        .expect(200);


                assert.equal(
                    response.body.payload.status,
                    "cancelled"
                );
            }
        );


        await t.test(
            "segundo usuario puede inscribirse después de liberar el cupo",
            async () => {
                const response =
                    await secondUserAgent
                        .post(
                            `/api/events/${capacityEventId}/tickets`
                        )
                        .send({
                            quantity: 1
                        })
                        .expect(201);


                assert.equal(
                    response.body.payload.status,
                    "confirmed"
                );
            }
        );


        await t.test(
            "listado publicado devuelve estructura paginada",
            async () => {
                const response =
                    await request(app)
                        .get(
                            "/api/events?status=published&page=2&limit=5"
                        )
                        .expect(200);


                assert.equal(
                    response.body.status,
                    "success"
                );


                assert.ok(
                    Array.isArray(
                        response.body.data
                    )
                );


                assert.equal(
                    response.body.page,
                    2
                );


                assert.equal(
                    response.body.limit,
                    5
                );


                assert.equal(
                    typeof response.body.total,
                    "number"
                );


                assert.equal(
                    typeof response.body.totalPages,
                    "number"
                );
            }
        );


        await t.test(
            "se ejecutaron emails de registro, confirmación y cancelación",
            async () => {
                assert.equal(
                    sentEmails,
                    7
                );
            }
        );
    }
);


test(
    "la concurrencia no permite sobreventa del último cupo",
    async () => {

        const organizerAgent =
            request.agent(app);

        const userOneAgent =
            request.agent(app);

        const userTwoAgent =
            request.agent(app);


        const organizerData = {
            first_name: "Organizer",
            last_name: "Concurrencia",
            email:
                "organizer.concurrency@example.com",
            password: "Test12345"
        };


        const userOneData = {
            first_name: "Usuario",
            last_name: "Uno",
            email:
                "user.one.concurrency@example.com",
            password: "Test12345"
        };


        const userTwoData = {
            first_name: "Usuario",
            last_name: "Dos",
            email:
                "user.two.concurrency@example.com",
            password: "Test12345"
        };


        await createRoleFixture(
            organizerData,
            "organizer"
        );


        await organizerAgent
            .post(
                "/api/sessions/login"
            )
            .send({
                email:
                    organizerData.email,
                password:
                    organizerData.password
            })
            .expect(200);


        await userOneAgent
            .post(
                "/api/sessions/register"
            )
            .send(userOneData)
            .expect(201);


        await userOneAgent
            .post(
                "/api/sessions/login"
            )
            .send({
                email:
                    userOneData.email,
                password:
                    userOneData.password
            })
            .expect(200);


        await userTwoAgent
            .post(
                "/api/sessions/register"
            )
            .send(userTwoData)
            .expect(201);


        await userTwoAgent
            .post(
                "/api/sessions/login"
            )
            .send({
                email:
                    userTwoData.email,
                password:
                    userTwoData.password
            })
            .expect(200);


        const eventResponse =
            await organizerAgent
                .post(
                    "/api/events"
                )
                .send({
                    title:
                        "Evento último cupo",
                    description:
                        "Prueba de concurrencia",
                    category:
                        "Test",
                    date:
                        new Date(
                            Date.now() +
                            86400000 * 30
                        ).toISOString(),
                    location:
                        "Mar del Plata",
                    capacity: 1,
                    price: 0
                })
                .expect(201);


        const eventId =
            eventResponse.body.payload.id;


        await organizerAgent
            .patch(
                `/api/events/${eventId}/status`
            )
            .send({
                status: "published"
            })
            .expect(200);


        const emailCountBefore =
            sentEmails;


        const [
            responseOne,
            responseTwo
        ] = await Promise.all([
            userOneAgent
                .post(
                    `/api/events/${eventId}/tickets`
                )
                .send({
                    quantity: 1
                }),

            userTwoAgent
                .post(
                    `/api/events/${eventId}/tickets`
                )
                .send({
                    quantity: 1
                })
        ]);


        const statusCodes = [
            responseOne.status,
            responseTwo.status
        ].sort(
            (a, b) => a - b
        );


        assert.deepEqual(
            statusCodes,
            [201, 409]
        );


        const successfulResponse =
            responseOne.status === 201
                ? responseOne
                : responseTwo;


        const rejectedResponse =
            responseOne.status === 409
                ? responseOne
                : responseTwo;


        assert.equal(
            successfulResponse.body
                .payload.status,
            "confirmed"
        );


        assert.equal(
            rejectedResponse.body.message,
            "No hay cupos suficientes disponibles"
        );


        const ticketsResponse =
            await organizerAgent
                .get(
                    `/api/events/${eventId}/tickets`
                )
                .expect(200);


        assert.equal(
            ticketsResponse.body.payload.length,
            1
        );


        assert.equal(
            ticketsResponse.body
                .payload[0]
                .status,
            "confirmed"
        );


        assert.equal(
            sentEmails - emailCountBefore,
            1
        );
    }
);