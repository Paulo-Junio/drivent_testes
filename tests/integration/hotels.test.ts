import app, { init } from "@/app";
import httpStatus from "http-status";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import { createEnrollmentWithAddress, createTicket, createTicketTypeAllOk, createTicketTypeNoHotel, createTicketTypeRemote, createUser } from "../factories";
import { TicketStatus } from "@prisma/client";
import { createHotel, createRoom } from "../factories/hotel-factory";
import { prisma } from "@/config";

beforeAll(async () => {
  await init();
  await cleanDb();
  await prisma.$queryRaw`ALTER SEQUENCE "Hotel_id_seq" RESTART WITH 1`;
  await prisma.$queryRaw`ALTER SEQUENCE "Room_id_seq" RESTART WITH 1`;
});

afterEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("Deve responder 401 se não for enviado um token", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("Deve responder 401 se o token enviado não for válido", async () => {
    const response = await server.get("/hotels").set("Authorization", "Bearer XXXXX");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  // Para tokens válidos;
  it("Usuário sem inscrição deve responder 404", async () => {
    const token = await generateValidToken();
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  }),

  it("Para usuários sem ticket, deve retornar 404", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createEnrollmentWithAddress(user); 
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  }),

  it("Para usuário em que o ticket é remoto deve responder com 404", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeRemote();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
  }),

  it("Para usuário em que o ticket é presencial, mas não inclui hotel deve responder com 404", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeNoHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
  }),

  it("Para usuário em que o ticket é presencial, inclui hotel, mas não foi pago deve responder com 404", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeAllOk();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
  }),

  it("Para usuário em que o ticket é presencial, inclui hotel, foi pago deve retornar as opções de hotel", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeAllOk();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.OK);
    expect(response.body).toEqual([]);
  });
});

describe("GET /hotels/:hotelId", () => {
  it("Deve responder 401 se não for enviado um token", async () => {
    const response = await server.get("/hotels/:hotelId");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("Deve responder 401 se o token enviado não for válido", async () => {
    const response = await server.get("/hotels/:hotelId").set("Authorization", "Bearer XXXXX");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  // Para tokens válidos;
  it("Usuário sem inscrição deve responder 404", async () => {
    const token = await generateValidToken();
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  }),

  it("Para usuários sem ticket, deve retornar 404", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createEnrollmentWithAddress(user); 
    const response = await server.get("/hotels/:hotelId").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  }),

  it("Para usuário em que o ticket é remoto deve responder com 404", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeRemote();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.get("/hotels/:hotelId").set("Authorization", `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
  }),

  it("Para usuário em que o ticket é presencial, mas não inclui hotel deve responder com 404", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeNoHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.get("/hotels/:hotelId").set("Authorization", `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
  }),

  it("Para usuário em que o ticket é presencial, inclui hotel, mas não foi pago deve responder com 404", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeAllOk();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const response = await server.get("/hotels/:hotelId").set("Authorization", `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
  }),

  it("Para usuário em que o ticket é presencial, inclui hotel, foi pago, mas não existe hotel deve responder com 404", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeAllOk();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    const response = await server.get("/hotels/0").set("Authorization", `Bearer ${token}`);

    expect(response.status).toEqual(httpStatus.NOT_FOUND);
  });

  it("Para usuário em que o ticket é presencial, inclui hotel, foi pago e existe hotel deve responder com 200", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeAllOk();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    await createHotel();
    await createRoom();

    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
  
    expect(response.status).toEqual(httpStatus.OK);
    expect(response.body).toEqual(
      {
        id: expect.any(Number),
        name: expect.any(String),
        image: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        Rooms: [
          {
            id: expect.any(Number),
            name: expect.any(String),
            capacity: expect.any(Number),
            hotelId: expect.any(Number),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }
        ]
      });
  });
});
