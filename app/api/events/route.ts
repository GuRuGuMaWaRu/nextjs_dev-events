import { NextRequest, NextResponse } from "next/server";
import { toHttpStatus } from "@/lib/http-status";
import {
  createEventAction,
  deleteEventAction,
  getEventsAction,
} from "@/features/Event/actions";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const raw = Object.fromEntries(formData.entries());
    const createdEventResult = await createEventAction(raw);

    if (!createdEventResult.ok) {
      return NextResponse.json(
        {
          message: createdEventResult.message,
          details: createdEventResult.details,
        },
        { status: toHttpStatus(createdEventResult.code) },
      );
    }

    return NextResponse.json(
      {
        message: "Event created successfully",
        event: createdEventResult.data!,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Event creation failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const eventsResult = await getEventsAction();

    if (!eventsResult.ok) {
      const status = toHttpStatus(eventsResult.code);
      const message = eventsResult.message ?? "Events fetching failed";
      return NextResponse.json({ message, error: message }, { status });
    }

    return NextResponse.json(
      { message: "Events fetched successfully", events: eventsResult.data },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Events fetching failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const eventId = searchParams.get("id");
    if (!eventId) {
      return NextResponse.json(
        { message: "Event ID is required" },
        { status: 400 },
      );
    }

    const deletedEventResult = await deleteEventAction(eventId);
    if (!deletedEventResult.ok) {
      return NextResponse.json(
        { message: deletedEventResult.message },
        { status: toHttpStatus(deletedEventResult.code) },
      );
    }

    return NextResponse.json(
      { message: "Event deleted successfully", event: deletedEventResult.data },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Event deletion failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
