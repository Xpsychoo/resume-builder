import { normalizeResume, type Resume } from "./resume";

/**
 * Share links carry the whole resume in the URL fragment (#r=...), compressed
 * with the browser's built-in CompressionStream. Fragments are never sent to
 * the server, so shared resumes are not stored or logged anywhere.
 */

export const SHARE_PARAM = "r";
/** Upper bound for decompressed data, so a crafted link can't exhaust memory. */
export const MAX_DECODED_BYTES = 256 * 1024;
const MAX_ENCODED_CHARS = 100_000;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function readAll(stream: ReadableStream<Uint8Array>, limit: number): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel();
      throw new Error("Shared resume is too large.");
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}

function pipe(bytes: Uint8Array, transform: CompressionStream | DecompressionStream): ReadableStream<Uint8Array> {
  const source = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });
  return source.pipeThrough(transform as unknown as ReadableWritablePair<Uint8Array, Uint8Array>);
}

export async function encodeResume(resume: Resume): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(resume));
  const compressed = await readAll(pipe(json, new CompressionStream("deflate-raw")), Number.MAX_SAFE_INTEGER);
  return toBase64Url(compressed);
}

/** Decodes and normalises a share payload. Throws on anything malformed. */
export async function decodeResume(payload: string): Promise<Resume> {
  if (!payload || payload.length > MAX_ENCODED_CHARS || !/^[A-Za-z0-9_-]+$/.test(payload)) {
    throw new Error("This share link is invalid.");
  }
  const bytes = await readAll(pipe(fromBase64Url(payload), new DecompressionStream("deflate-raw")), MAX_DECODED_BYTES);
  const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
  return normalizeResume(parsed);
}

export function shareUrl(origin: string, payload: string): string {
  return `${origin}/view#${SHARE_PARAM}=${payload}`;
}

/** Extracts the payload from a location hash such as "#r=abc". */
export function payloadFromHash(hash: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  return params.get(SHARE_PARAM);
}
