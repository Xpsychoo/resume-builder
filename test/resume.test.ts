// @vitest-environment node
import { describe, expect, it } from "vitest";
import { commaList, dateRange, emptyResume, hasContent, lines, LIMITS, moveItem, normalizeResume, safeHref, sampleResume, SECTION_IDS } from "@/lib/resume";

describe("normalizeResume", () => {
  it("round-trips a valid resume unchanged", () => {
    const sample = sampleResume();
    expect(normalizeResume(JSON.parse(JSON.stringify(sample)))).toEqual(sample);
  });

  it("turns garbage into an empty resume instead of throwing", () => {
    for (const input of [null, undefined, 42, "x", [], { profile: "nope", experience: "nope" }]) {
      const r = normalizeResume(input);
      expect(r.profile.name).toBe("");
      expect(r.experience).toEqual([]);
      expect(r.sections.map((s) => s.id)).toEqual([...SECTION_IDS]);
    }
  });

  it("enforces field and list size limits", () => {
    const r = normalizeResume({
      profile: { name: "x".repeat(1000) },
      summary: "y".repeat(10_000),
      skills: Array.from({ length: 100 }, () => ({ label: "a", items: "b" })),
    });
    expect(r.profile.name).toHaveLength(LIMITS.shortText);
    expect(r.summary).toHaveLength(LIMITS.longText);
    expect(r.skills).toHaveLength(LIMITS.items);
  });

  it("strips control characters but keeps newlines", () => {
    expect(normalizeResume({ summary: "a\u0000b\nc\u0007" }).summary).toBe("ab\nc");
  });

  it("rejects unknown settings and invalid colours", () => {
    const r = normalizeResume({ settings: { template: "evil", accent: "red; background:url(x)", font: "comic", density: "huge" } });
    expect(r.settings).toEqual(emptyResume().settings);
    expect(normalizeResume({ settings: { accent: "#ABCDEF" } }).settings.accent).toBe("#abcdef");
  });

  it("keeps each section once, in order, and appends missing ones", () => {
    const r = normalizeResume({
      sections: [
        { id: "skills", visible: false },
        { id: "skills", visible: true },
        { id: "bogus", visible: true },
        { id: "summary" },
      ],
    });
    expect(r.sections.slice(0, 2)).toEqual([
      { id: "skills", visible: false },
      { id: "summary", visible: true },
    ]);
    expect(r.sections).toHaveLength(SECTION_IDS.length);
  });

  it("replaces unsafe item ids", () => {
    const r = normalizeResume({ experience: [{ id: "<script>", role: "Dev" }] });
    expect(r.experience[0]?.id).toMatch(/^[a-z0-9]+$/);
  });
});

describe("safeHref", () => {
  it.each([
    ["example.com", "https://example.com/"],
    ["https://github.com/me", "https://github.com/me"],
    ["http://old.example", "http://old.example/"],
  ])("accepts %s", (input, expected) => expect(safeHref(input)).toBe(expected));

  it.each(["javascript:alert(1)", "JavaScript:alert(1)", "data:text/html,hi", "vbscript:x", "file:///etc/passwd", "   "])("rejects %s", (input) => {
    expect(safeHref(input)).toBeNull();
  });

  it("builds mailto and tel links only for valid values", () => {
    expect(safeHref("a@b.co", "email")).toBe("mailto:a@b.co");
    expect(safeHref("not an email", "email")).toBeNull();
    expect(safeHref("+91 98765 43210", "phone")).toBe("tel:+919876543210");
    expect(safeHref("call me", "phone")).toBeNull();
  });
});

describe("text helpers", () => {
  it("splits bullet lines and strips typed bullet markers", () => {
    expect(lines("- one\n\n• two\n  * three  \n")).toEqual(["one", "two", "three"]);
  });

  it("splits comma lists", () => {
    expect(commaList(" React, , Next.js ,TS ")).toEqual(["React", "Next.js", "TS"]);
  });

  it("formats date ranges", () => {
    expect(dateRange("Jan 2023", "Dec 2024")).toBe("Jan 2023 – Dec 2024");
    expect(dateRange("Jan 2023", "ignored", true)).toBe("Jan 2023 – Present");
    expect(dateRange("", "2021")).toBe("2021");
    expect(dateRange("", "")).toBe("");
  });

  it("moves items and ignores out-of-range moves", () => {
    expect(moveItem(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
    const same = ["a", "b"];
    expect(moveItem(same, 0, 5)).toBe(same);
  });

  it("detects empty sections", () => {
    const r = emptyResume();
    expect(hasContent(r, "summary")).toBe(false);
    expect(hasContent({ ...r, skills: [{ id: "a", label: "", items: " " }] }, "skills")).toBe(false);
    expect(hasContent(sampleResume(), "experience")).toBe(true);
  });
});
