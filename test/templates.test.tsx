import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResumeDocument } from "@/components/templates/ResumeDocument";
import { sampleResume, TEMPLATES, type Resume } from "@/lib/resume";

function headings() {
  return screen.queryAllByRole("heading", { level: 2 }).map((h) => h.textContent?.trim());
}

describe("ResumeDocument", () => {
  it.each(TEMPLATES)("renders the %s template with all content", (template) => {
    const base = sampleResume();
    render(<ResumeDocument resume={{ ...base, settings: { ...base.settings, template } }} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("John Doe");
    expect(screen.getByText("Example Tech Pvt. Ltd.")).toBeInTheDocument();
    expect(screen.getByText(/Cut page load time by 40%/)).toBeInTheDocument();
    expect(screen.getByText("Jan 2023 – Present")).toBeInTheDocument();
  });

  it("follows the section order and hides hidden or empty sections", () => {
    const resume: Resume = {
      ...sampleResume(),
      certifications: [],
      sections: [
        { id: "skills", visible: true },
        { id: "experience", visible: true },
        { id: "summary", visible: false },
        { id: "projects", visible: true },
        { id: "education", visible: true },
        { id: "certifications", visible: true },
      ],
    };
    render(<ResumeDocument resume={resume} />);
    expect(headings()).toEqual(["Skills", "Experience", "Projects", "Education"]);
  });

  it("links contact details safely and never renders unsafe URLs as links", () => {
    const base = sampleResume();
    render(<ResumeDocument resume={{ ...base, profile: { ...base.profile, website: "javascript:alert(1)" } }} />);
    expect(screen.getByRole("link", { name: "john.doe@example.com" })).toHaveAttribute("href", "mailto:john.doe@example.com");
    const github = screen.getByRole("link", { name: "github.com/johndoe-example" });
    expect(github).toHaveAttribute("href", "https://github.com/johndoe-example");
    expect(github).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("javascript:alert(1)").closest("a")).toBeNull();
  });

  it("shows a placeholder name and no sections for an empty resume", () => {
    const base = sampleResume();
    const empty: Resume = { ...base, profile: { ...base.profile, name: "" }, summary: "", experience: [], projects: [], education: [], skills: [], certifications: [] };
    render(<ResumeDocument resume={empty} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Your Name");
    expect(headings()).toEqual([]);
  });

  it("applies the accent colour", () => {
    const base = sampleResume();
    render(<ResumeDocument resume={{ ...base, settings: { ...base.settings, accent: "#be123c" } }} />);
    expect(screen.getByRole("article").style.getPropertyValue("--accent")).toBe("#be123c");
  });
});
