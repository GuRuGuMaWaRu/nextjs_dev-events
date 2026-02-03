import { NextResponse } from "next/server";

import { AppErrorCode } from "@/core/types";
import { getEventBySlugAction } from "@/features/Event/actions";

const toHttpStatus = (code: AppErrorCode): number => {
  switch (code) {
    case "VALIDATION":
      return 400;
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "CONFLICT":
      return 409;
    case "BUSINESS":
      return 400;
    default:
      return 500;
  }
};

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ slug: string }>;
  }
): Promise<NextResponse> {
  try {
    const { slug } = await params;

    const result = await getEventBySlugAction(slug);

    if (!result.ok) {
      const status = toHttpStatus(result.code);
      const message = result.message ?? "Event fetching failed";
      return NextResponse.json({ message, error: message }, { status });
    }
    
    if (!result.data) {
      return NextResponse.json(
        { message: "Event not found", error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Event fetched successfully", event: result.data },
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
