"use server";

import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";
import { Booking, BookingDocument, Event } from "@/database";
import { toAppError } from "@/core/app-error";
import { AppResult } from "@/core/types";
import { SimilarEventDto } from "@/features/Event/types";

export const getSimilarEventsBySlugAction = async (
  slug: string
): Promise<AppResult<SimilarEventDto[]>> => {
  try {
    await connectToDatabase();

    const event = await Event.findOne({ slug });
    if (!event) {
      return { ok: false, code: "NOT_FOUND", message: "Event not found" };
    }

    const similarEvents = await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    })
      .select("title image slug location date time -_id")
      .limit(3)
      .lean<SimilarEventDto[]>();

    return {
      ok: true,
      data: similarEvents,
    };
  } catch (error) {
    return toAppError(error, "Failed to get similar events");
  }
};

const validateBookingAction = async (
  email: string,
  eventId: string
): Promise<AppResult<void>> => {
  try {
    await connectToDatabase();

    const booking = await Booking.findOne({ email, eventId });
    if (booking) {
      return {
        ok: false,
        code: "CONFLICT",
        message: "You have already booked this event.",
      };
    }

    return { ok: true };
  } catch (error) {
    return toAppError(error, "Failed to validate booking");
  }
};

export const bookEventAction = async (
  email: string,
  eventId: string
): Promise<AppResult<BookingDocument>> => {
  try {
    await connectToDatabase();

    const isValid = await validateBookingAction(email, eventId);
    if (!isValid.ok) {
      return isValid;
    }
    
    const booking = await Booking.create({ email, eventId });

    return { ok: true, data: booking };
  } catch (error) {
    return toAppError(error, "Failed to book event");
  }
};

export const getBookingsByEventAction = async (
  eventId: Types.ObjectId
): Promise<AppResult<BookingDocument[]>> => {
  try {
    await connectToDatabase();

    const bookings = await Booking.findByEvent(eventId);
    return { ok: true, data: bookings };
  } catch (error) {
    return toAppError(error, "Failed to fetch bookings");
  }
};
