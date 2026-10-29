import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Builder from "@/components/Builder";
import { emptyResume } from "@/lib/resume";

vi.mock("next/link", () => ({ default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => <a href={href} {...props}>{children}</a> }));

const preview = () => screen.getByRole("article");

describe("Builder", () => {
  it("starts with the sample and updates the preview as you type", async () => {
    const user = userEvent.setup();
    render(<Builder />);
    expect(within(preview()).getByRole("heading", { level: 1 })).toHaveTextContent("Aarav Mehta");

    const name = screen.getByLabelText("Full name");
    await user.clear(name);
    await user.type(name, "Ajay Kumar");
    expect(within(preview()).getByRole("heading", { level: 1 })).toHaveTextContent("Ajay Kumar");
  });

  it("autosaves to the browser and restores on reload", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { unmount } = render(<Builder />);
      const title = screen.getByLabelText("Job title");
      await user.clear(title);
      await user.type(title, "Staff Engineer");
      await act(() => vi.advanceTimersByTimeAsync(500));
      unmount();
    } finally {
      vi.useRealTimers();
    }
    render(<Builder />);
    expect(screen.getByLabelText("Job title")).toHaveValue("Staff Engineer");
  });

  it("adds an experience entry that appears in the preview", async () => {
    localStorage.setItem("resumecraft:resume:v1", JSON.stringify(emptyResume()));
    const user = userEvent.setup();
    render(<Builder />);
    expect(within(preview()).queryByRole("heading", { name: "Experience" })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Add experience" }));
    await user.type(screen.getByLabelText("Role"), "Intern");
    await user.type(screen.getByLabelText("Company"), "Acme");
    expect(within(preview()).getByRole("heading", { name: "Experience" })).toBeInTheDocument();
    expect(within(preview()).getByText("Intern")).toBeInTheDocument();
  });

  it("switches templates and hides sections from the design tab", async () => {
    const user = userEvent.setup();
    render(<Builder />);
    await user.click(screen.getByRole("tab", { name: "design" }));
    const modern = screen.getByRole("radio", { name: "Modern" });
    await user.click(modern);
    expect(modern).toHaveAttribute("aria-checked", "true");

    expect(within(preview()).getByRole("heading", { name: "Summary" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Hide Summary" }));
    expect(within(preview()).queryByRole("heading", { name: "Summary" })).toBeNull();
  });

  it("creates a share link for the current resume", async () => {
    const user = userEvent.setup();
    render(<Builder />);
    await user.click(screen.getByRole("button", { name: "Share" }));
    const input = (await screen.findByLabelText("Share link")) as HTMLInputElement;
    await vi.waitFor(() => expect(input.value).toMatch(new RegExp(`^${window.location.origin}/view#r=[A-Za-z0-9_-]+$`)));
  });
});
