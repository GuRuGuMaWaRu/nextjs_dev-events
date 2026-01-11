"use server";

import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";
import { Booking, Event, type EventDocument } from "@/database";

export const getSimilarEventsBySlugAction = async (slug: string) => {
  try {
    await connectToDatabase();

    const event = await Event.findOne({ slug });
    if (!event) {
      return [];
    }

    const similarEvents: EventDocument[] = await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    })
      .limit(3)
      .lean();

    return similarEvents.map((event) => ({
      title: event.title,
      image: event.image,
      slug: event.slug,
      location: event.location,
      date: event.date,
      time: event.time,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const validateBooking = async (email: string, eventId: string) => {
  const booking = await Booking.findOne({ email, eventId });
  if (booking) {
    return { success: false, error: "You have already booked this event." };
  }
  return { success: true };
};

export const bookEvent = async (email: string, eventId: string) => {
  const isValid = await validateBooking(email, eventId);
  if (!isValid.success) {
    return { success: false, error: isValid.error };
  }
  const booking = await Booking.create({ email, eventId });
  return { success: true, data: booking };
};

export const getBookingsByEventAction = async (eventId: Types.ObjectId) => {
  try {
    await connectToDatabase();
    const bookings = await Booking.findByEvent(eventId);
    return { success: true, data: bookings };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to fetch bookings" };
  }
};
