export const runtime = "nodejs";

import { Readable } from "node:stream";
import { ReadableStream } from "node:stream/web";
import { v2 as cloudinary } from "cloudinary";

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
