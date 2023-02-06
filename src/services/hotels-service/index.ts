import { notFoundError } from "@/errors";
import hotelsRepository from "@/repositories/hotels-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function getHotels(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.Address[0].enrollmentId);
  if (!ticket) {
    throw notFoundError();
  }
  if(ticket.status === "RESERVED") {
    throw Error("payment required");
  }

  const remoteOrNoIncludeHotel = await ticketRepository.findTicketType(ticket.ticketTypeId);
  if(remoteOrNoIncludeHotel.includesHotel === false || remoteOrNoIncludeHotel.isRemote === true) {
    throw Error("payment required");
  }

  const hotelsList = await hotelsRepository.getHotels();

  if (!hotelsList) {
    throw notFoundError();
  }
  return hotelsList;
}

async function getHotelRooms(hotelId: number, userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.Address[0].enrollmentId);
  if (!ticket) {
    throw notFoundError();
  }
  if(ticket.status === "RESERVED") {
    throw Error("payment required");
  }

  const remoteOrNoIncludeHotel = await ticketRepository.findTicketType(ticket.ticketTypeId);
  if(remoteOrNoIncludeHotel.includesHotel === false || remoteOrNoIncludeHotel.isRemote === true) {
    throw Error("payment required");
  }
  
  const rooms = await hotelsRepository.getHotelRooms(hotelId);
  if (!rooms) {
    throw notFoundError();
  }

  return rooms;
}

const hotelsService = {
  getHotels,
  getHotelRooms
};

export default hotelsService;
