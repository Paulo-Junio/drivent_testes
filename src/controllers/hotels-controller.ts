import { AuthenticatedRequest } from "@/middlewares";
import hotelsService from "@/services/hotels-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const userId = Number(req.userId);
  try {
    const hotelsList = await hotelsService.getHotels(userId);
  
    return res.status(httpStatus.OK).send(hotelsList);
  } catch (error) {
    if (error.message === "payment required") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    if (error.message === "No result for this search!") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function getHotelRooms(req: AuthenticatedRequest, res: Response) {
  const  hotelId = Number(req.params.hotelId);
  const userId = Number(req.userId);
  try {
    const rooms = await hotelsService.getHotelRooms(hotelId, userId);
  
    return res.status(httpStatus.OK).send(rooms);
  } catch (error) {
    if (error.message === "payment required") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    if (error.message === "No result for this search!") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

