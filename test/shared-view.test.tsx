import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SharedView from "@/components/SharedView";
import { sampleResume } from "@/lib/resume";
import { encodeResume } from "@/lib/share";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next/link", () => ({ default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => <a href={href} {...props}>{children}</a> }));

afterEach(() => {
  window.location.hash = "";
});

describe("SharedView", () => {
  it("opens a resume from the link fragment", async () => {
    window.location.hash = `#r=${await encodeResume(sampleResume())}`;
    render(<SharedView />);
    expect(await screen.findByRole("heading", { level: 1, name: "Aarav Mehta" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Download PDF/ })).toBeInTheDocument();
  });

  it("explains when the link has no resume", () => {
    render(<SharedView />);
    expect(screen.getByText("This link doesn't contain a resume.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Build your own resume" })).toHaveAttribute("href", "/");
  });

  it("explains when the link is corrupted", async () => {
    window.location.hash = "#r=Zm9vYmFy";
    render(<SharedView />);
    expect(await screen.findByText(/broken or incomplete/)).toBeInTheDocument();
  });
});
