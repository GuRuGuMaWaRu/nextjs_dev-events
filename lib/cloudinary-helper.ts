import { Readable } from "node:stream";
import { ReadableStream } from "node:stream/web";
import { v2 as cloudinary } from "cloudinary";

/**
 * Extracts the public_id from a Cloudinary URL.
 * Cloudinary URLs follow the pattern:
 * https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{folder}/{public_id}.{format}
 * or
 * https://res.cloudinary.com/{cloud_name}/image/upload/{folder}/{public_id}.{format}
 */
function extractPublicIdFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)/);
    if (!match) {
      return null;
    }

    const pathWithExtension = match[1];
    const publicId = pathWithExtension.replace(/\.[^/.]+$/, "");

    return publicId || null;
  } catch {
    return null;
  }
}

export const uploadToCloudinary = (
  file: File,
): Promise<{ secure_url: string }> => {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { resource_type: "image", folder: "dev-events" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result as { secure_url: string });
      },
    );

    Readable.fromWeb(file.stream() as unknown as ReadableStream).pipe(upload);
  });
};

/**
 * Deletes an image from Cloudinary by URL. Uses extractPublicIdFromUrl to get
 * public_id, then calls cloudinary.uploader.destroy. Logs but never throws so
 * callers can use it for cleanup without masking the original error.
 */
export async function deleteImageFromCloudinary(
  imageUrl: string,
): Promise<void> {
  if (!imageUrl?.trim()) {
    return;
  }

  const publicId = extractPublicIdFromUrl(imageUrl);
  if (!publicId) {
    console.warn(`Could not extract public_id from URL: ${imageUrl}`);
    return;
  }

  try {
    const result = await new Promise<{ result: string }>((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        { invalidate: true, resource_type: "image" },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as { result: string });
          }
        },
      );
    });

    if (result?.result === "ok") {
      console.log(`Successfully deleted image from Cloudinary: ${publicId}`);
    } else if (result?.result === "not found") {
      console.warn(
        `Image not found in Cloudinary: ${publicId}. URL was: ${imageUrl}`,
      );
    } else {
      console.warn(`Unexpected result from Cloudinary destroy:`, result);
    }
  } catch (cloudinaryError) {
    console.error(
      `Error deleting image from Cloudinary (public_id: ${publicId}, url: ${imageUrl}):`,
      cloudinaryError,
    );
  }
}
