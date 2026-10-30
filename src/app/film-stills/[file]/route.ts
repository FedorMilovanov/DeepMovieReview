import { readFile } from "node:fs/promises";
import path from "node:path";
import { isPreviewContentEnabled } from "@/data/site-config";

/**
 * Film stills are served through the app, not from `public`.
 *
 * A file in `public` is a public URL: it is reachable whether or not the page
 * that cites it is closed, so a draft edition would still hand out frames of the
 * film — including the final shot — to anyone who guessed the name. These four
 * stills exist only for a preview build, so the route answers with the same gate
 * the article page uses and with the same cache policy.
 */

const STILL_NAME = /^[a-z0-9-]+\.(?:jpg|avif)$/;

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  avif: "image/avif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  if (!STILL_NAME.test(file) || !isPreviewContentEnabled()) {
    return new Response("Not found", { status: 404 });
  }

  const extension = file.slice(file.lastIndexOf(".") + 1);
  try {
    const bytes = await readFile(path.join(process.cwd(), "assets", "film-stills", file));
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": CONTENT_TYPES[extension] ?? "application/octet-stream",
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
