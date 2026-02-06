import { Types } from "mongoose";

import { EventDocument } from "@/database";
import { EventDetailDto } from "@/features/Event/types";

export const toEventDetailDto = (
  event: EventDocument | (EventDetailDto<Types.ObjectId> & { _id: Types.ObjectId })
): EventDetailDto => {
  const eventObject =
    typeof (event as EventDocument).toObject === "function"
      ? (event as EventDocument).toObject()
      : event;

  return {
    ...eventObject,
    _id: eventObject._id.toString(),
  };
};
