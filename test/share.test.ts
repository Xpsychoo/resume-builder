// @vitest-environment node
import { describe, expect, it } from "vitest";
import { normalizeResume, sampleResume } from "@/lib/resume";
import { decodeResume, encodeResume, MAX_DECODED_BYTES, payloadFromHash, shareUrl } from "@/lib/share";

async function deflate(text: string): Promise<string> {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  return Buffer.from(bytes).toString("base64url");
}

describe("share links", () => {
  it("round-trips a resume through the URL-safe payload", async () => {
    const resume = sampleResume();
    const payload = await encodeResume(resume);
    expect(payload).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(await decodeResume(payload)).toEqual(resume);
  });

  it("produces links short enough to paste anywhere", async () => {
    const payload = await encodeResume(sampleResume());
    expect(shareUrl("https://resume.example", payload).length).toBeLessThan(4000);
  });

  it("normalises decoded data, so crafted links can't inject unsafe values", async () => {
    const payload = await deflate(JSON.stringify({ profile: { name: "Eve" }, settings: { accent: "url(javascript:x)", template: "x" } }));
    const decoded = await decodeResume(payload);
    expect(decoded.profile.name).toBe("Eve");
    expect(decoded.settings).toEqual(normalizeResume({}).settings);
  });

  it.each(["", "not base64!", "%%%", "a".repeat(100_001)])("rejects malformed payload %#", async (payload) => {
    await expect(decodeResume(payload)).rejects.toThrow();
  });

  it("rejects payloads that are valid base64 but not compressed JSON", async () => {
    await expect(decodeResume(Buffer.from("hello world").toString("base64url"))).rejects.toThrow();
  });

  it("refuses to decompress beyond the size limit", async () => {
    const bomb = await deflate(JSON.stringify({ summary: "a".repeat(MAX_DECODED_BYTES * 2) }));
    expect(bomb.length).toBeLessThan(2000);
    await expect(decodeResume(bomb)).rejects.toThrow(/too large/);
  });

  it("reads the payload from the location hash", () => {
    expect(payloadFromHash("#r=abc_-1")).toBe("abc_-1");
    expect(payloadFromHash("")).toBeNull();
    expect(payloadFromHash("#other=1")).toBeNull();
  });
});
