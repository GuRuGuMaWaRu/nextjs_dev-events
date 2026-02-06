import { NextRequest, NextResponse } from "next/server";
import { toHttpStatus } from "@/lib/http-status";
import {
  createEventService,
  deleteEventService,
  getEventsService,
} from "@/features/Event/service.server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    let event;
    try {
      event = Object.fromEntries(formData.entries());
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: "Invalid form data" },
        { status: 400 }
      );
    }

    const file = formData.get("image") as File;
    if (!file) {
      return NextResponse.json(
        { message: "Image is required" },
        { status: 400 }
      );
    }

    const tagsRaw = formData.get("tags");
    const agendaRaw = formData.get("agenda");

    if (!tagsRaw || !agendaRaw) {
      return NextResponse.json(
        { message: "Tags and agenda are required" },
        { status: 400 }
      );
    }

    let parsedTags: string[];
    let parsedAgenda: string[];

    try {
      parsedTags = JSON.parse(tagsRaw as string) as string[];
      parsedAgenda = JSON.parse(agendaRaw as string) as string[];
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: "Invalid tags or agenda format" },
        { status: 400 }
      );
    }

    const createdEvent = await createEventService({
      title: event.title as string,
      description: event.description as string,
      overview: event.overview as string,
      image: file,
      venue: event.venue as string,
      location: event.location as string,
      date: event.date as string,
      time: event.time as string,
      mode: event.mode as string,
      audience: event.audience as string,
      agenda: parsedAgenda,
      organizer: event.organizer as string,
      tags: parsedTags,
    });

    if (!createdEvent.ok) {
      return NextResponse.json(
        { message: createdEvent.message },
        { status: toHttpStatus(createdEvent.code ?? 500) }
      );
    }

    return NextResponse.json(
      { message: "Event created successfully", event: createdEvent.data! },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Event creation failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await getEventsService();

    if (!result.ok) {
      const status = toHttpStatus(result.code);
      const message = result.message ?? "Events fetching failed";
      return NextResponse.json({ message, error: message }, { status });
    }

    return NextResponse.json({ message: 'Events fetched successfully', events: result.data }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Events fetching failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
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
        { status: 400 }
      );
    }

    const deletedEvent = await deleteEventService(eventId);
    if (!deletedEvent.ok) {
      return NextResponse.json(
        { message: deletedEvent.message },
        { status: toHttpStatus(deletedEvent.code ?? "BUSINESS") }
      );
    }

    return NextResponse.json(
      { message: "Event deleted successfully", event: deletedEvent.data },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Event deletion failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
