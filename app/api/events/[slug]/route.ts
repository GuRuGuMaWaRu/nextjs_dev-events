import { NextResponse } from "next/server";

import { Event } from "@/database";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ slug: string }>;
  }
): Promise<NextResponse> {
  try {
    await connectToDatabase();
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { message: "Event slug is required" },
        { status: 400 }
      );
    }

    const event = await Event.findOne({ slug }).select("-__v").lean();
    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Event fetched successfully", event },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Event fetching failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
