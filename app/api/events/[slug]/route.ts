import { NextResponse } from "next/server";

import { toHttpStatus } from "@/lib/http-status";
import { getEventBySlugAction } from "@/features/Event/actions";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ slug: string }>;
  },
): Promise<NextResponse> {
  try {
    const { slug } = await params;

    const eventResult = await getEventBySlugAction(slug);

    if (!eventResult.ok) {
      const status = toHttpStatus(eventResult.code);
      const message = eventResult.message ?? "Event fetching failed";
      return NextResponse.json({ message, error: message }, { status });
    }

    if (!eventResult.data) {
      return NextResponse.json(
        { message: "Event not found", error: "Event not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Event fetched successfully", event: eventResult.data },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Event fetching failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
