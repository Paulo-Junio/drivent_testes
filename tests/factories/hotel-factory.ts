import { prisma } from "@/config";

export async function createHotel() {
  return prisma.hotel.create({
    data: {
      name: "hotel palace",
      image: "https://media-cdn.tripadvisor.com/media/photo-s/16/1a/ea/54/hotel-presidente-4s.jpg",
    },
  });
}

export async function createRoom() {
  return prisma.room.create({
    data: {
      name: "palace hotel roomm",
      capacity: 3,
      hotelId: 1,
    },
  });
}
