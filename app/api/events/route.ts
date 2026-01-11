import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/database";

/**
 * Extracts the public_id from a Cloudinary URL.
 * Cloudinary URLs follow the pattern:
 * https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{folder}/{public_id}.{format}
 * or
 * https://res.cloudinary.com/{cloud_name}/image/upload/{folder}/{public_id}.{format}
 *
 * @param url - The Cloudinary image URL
 * @returns The public_id (including folder path) or null if the URL is invalid
 */
function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Match the pattern after /upload/
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)/);
    if (!match) {
      return null;
    }

    // Remove file extension and get the public_id
    const pathWithExtension = match[1];
    const publicId = pathWithExtension.replace(/\.[^/.]+$/, "");

    return publicId || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

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

    const tags = JSON.parse(formData.get("tags") as string);
    const agenda = JSON.parse(formData.get("agenda") as string);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "dev-events",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(buffer);
    });
    event.image = (uploadResult as { secure_url: string }).secure_url;

    const createdEvent = await Event.create({
      ...event,
      tags,
      agenda,
    });

    return NextResponse.json(
      { message: "Event created successfully", event: createdEvent },
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
    await connectToDatabase();

    const events = await Event.find().sort({ createdAt: -1 });
    return NextResponse.json(
      { message: "Events fetched successfully", events, total: events.length },
      { status: 200 }
    );
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
    await connectToDatabase();

    const { searchParams } = new URL(request.url);

    const eventId = searchParams.get("id");
    if (!eventId) {
      return NextResponse.json(
        { message: "Event ID is required" },
        { status: 400 }
      );
    }

    // Find the event first to get the image URL before deletion
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // Delete the image from Cloudinary if it exists
    if (event.image) {
      const publicId = extractPublicIdFromUrl(event.image);

      if (publicId) {
        try {
          const result = await new Promise<{ result: string }>(
            (resolve, reject) => {
              cloudinary.uploader.destroy(
                publicId,
                {
                  invalidate: true,
                  resource_type: "image",
                },
                (error, result) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(result as { result: string });
                  }
                }
              );
            }
          );

          // Check the result to verify deletion was successful
          if (result && result.result === "ok") {
            console.log(
              `Successfully deleted image from Cloudinary: ${publicId}`
            );
          } else if (result && result.result === "not found") {
            console.warn(
              `Image not found in Cloudinary: ${publicId}. URL was: ${event.image}`
            );
          } else {
            console.warn(`Unexpected result from Cloudinary destroy:`, result);
          }
        } catch (cloudinaryError) {
          // Log error but continue with database deletion
          console.error(
            `Error deleting image from Cloudinary (public_id: ${publicId}):`,
            cloudinaryError
          );
        }
      } else {
        console.warn(`Could not extract public_id from URL: ${event.image}`);
      }
    }

    // Delete the event from the database
    await Event.findByIdAndDelete(eventId);

    return NextResponse.json(
      { message: "Event deleted successfully", event },
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
