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

export const validateBookingAction = async (email: string, eventId: string) => {
  try {
    await connectToDatabase();
    const booking = await Booking.findOne({ email, eventId });
    if (booking) {
      return { success: false, error: "You have already booked this event." };
    }
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to validate booking" };
  }
};

export const bookEventAction = async (email: string, eventId: string) => {
  try {
    await connectToDatabase();
    const isValid = await validateBookingAction(email, eventId);
    if (!isValid.success) {
      return { success: false, error: isValid.error };
    }
    const booking = await Booking.create({ email, eventId });
    return { success: true, data: booking };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to book event" };
  }
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
