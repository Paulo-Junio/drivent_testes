import { notFoundError } from "@/errors";
import hotelsRepository from "@/repositories/hotels-repository";

async function getHotels() {
  const hotelsList = await hotelsRepository.getHotels();

  if (!hotelsList) {
    throw notFoundError();
  }
  return hotelsList;
}

async function getHotelRooms(hotelId: number) {
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
