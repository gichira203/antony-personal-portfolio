"use client";

/**
 * Client-side helpers shared by the admin project and testimonial editors.
 * Images are compressed in the browser, then stored in Postgres through
 * /api/uploads so they are visible on the public site immediately.
 */

const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 0.86;

async function compressImage(file: File): Promise<Blob> {
  if (typeof document === "undefined" || typeof createImageBitmap !== "function") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(bitmap.width, bitmap.height)
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY)
    );

    // Skip the compressed version if it somehow ended up larger.
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export async function uploadImage(file: File): Promise<string> {
  const blob = await compressImage(file);
  const form = new FormData();
  const name = file.name.replace(/\.[^.]+$/, "") || "image";
  form.append("file", blob, `${name}.webp`);

  const res = await fetch("/api/uploads", { method: "POST", body: form });
  const data = (await res.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };

  if (!res.ok || !data.url) {
    throw new Error(data.error || "Image upload failed");
  }

  return data.url;
}

/** Tell every open instance of the public site that content changed. */
export function broadcastContentUpdate(): void {
  try {
    const channel = new BroadcastChannel("portfolio-updates");
    channel.postMessage({ type: "content-updated", at: Date.now() });
    channel.close();
  } catch {
    /* older browsers fall back to the public page's polling */
  }
}
