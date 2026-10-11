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
let UserModel;
let transporter;

let sentEmails = 0;


before(async () => {
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "1h";

    process.env.MAIL_HOST = "localhost";
    process.env.MAIL_PORT = "2525";
    process.env.MAIL_USER = "test";
    process.env.MAIL_PASS = "test";
    process.env.MAIL_FROM = "test@example.com";


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


    const userModule = await import(
        "../models/User.js"
    );

    UserModel = userModule.UserModel;


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
    "flujo completo de integración de usuarios, eventos y tickets",
    async (t) => {

        const userAgent =
            request.agent(app);

        const organizerAgent =
            request.agent(app);


        const userData = {
            first_name: "Usuario",
            last_name: "Test",
            email: "user.test@example.com",
            password: "Test12345"
        };


        const organizerData = {
            first_name: "Organizer",
            last_name: "Test",
            email: "organizer.test@example.com",
            password: "Test12345"
        };


        let eventId;
        let ticketId;


        await t.test(
            "registro de usuario",
            async () => {
                const response =
                    await userAgent
                        .post(
                            "/api/sessions/register"
                        )
                        .send(userData)
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
                    response.body.payload.password,
                    undefined
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
            "registro del organizer",
            async () => {
                await organizerAgent
                    .post(
                        "/api/sessions/register"
                    )
                    .send(organizerData)
                    .expect(201);


                await UserModel.updateOne(
                    {
                        email:
                            organizerData.email
                    },
                    {
                        role: "organizer"
                    }
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
            "ruta protegida sin sesión devuelve 401",
            async () => {
                await request(app)
                    .get(
                        "/api/tickets/my-tickets"
                    )
                    .expect(401);
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
            "usuario se inscribe",
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
                    response.body.payload._id;


                assert.ok(ticketId);


                assert.equal(
                    response.body.payload.status,
                    "confirmed"
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
                    response.body.payload[0].status,
                    "confirmed"
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
            }
        );


        await t.test(
            "usuario cancela ticket",
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
                    response.body.payload.cancelledAt
                );
            }
        );


        await t.test(
            "se ejecutaron los emails de confirmación y cancelación",
            async () => {
                assert.equal(
                    sentEmails,
                    2
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


        await organizerAgent
            .post("/api/sessions/register")
            .send(organizerData)
            .expect(201);


        await UserModel.updateOne(
            {
                email:
                    organizerData.email
            },
            {
                role: "organizer"
            }
        );


        await organizerAgent
            .post("/api/sessions/login")
            .send({
                email:
                    organizerData.email,
                password:
                    organizerData.password
            })
            .expect(200);


        await userOneAgent
            .post("/api/sessions/register")
            .send(userOneData)
            .expect(201);


        await userOneAgent
            .post("/api/sessions/login")
            .send({
                email:
                    userOneData.email,
                password:
                    userOneData.password
            })
            .expect(200);


        await userTwoAgent
            .post("/api/sessions/register")
            .send(userTwoData)
            .expect(201);


        await userTwoAgent
            .post("/api/sessions/login")
            .send({
                email:
                    userTwoData.email,
                password:
                    userTwoData.password
            })
            .expect(200);


        const eventResponse =
            await organizerAgent
                .post("/api/events")
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
            [201, 400]
        );


        const successfulResponse =
            responseOne.status === 201
                ? responseOne
                : responseTwo;


        const rejectedResponse =
            responseOne.status === 400
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