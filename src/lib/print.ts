import type { Resume } from "./resume";
import { fileNameFor } from "./storage";

/**
 * Opens the browser's print dialog ("Save as PDF"). Browsers use the document
 * title as the default file name, so it is set temporarily.
 */
export function printResume(resume: Resume): void {
  const previous = document.title;
  document.title = fileNameFor(resume, "pdf").replace(/\.pdf$/, "");
  window.addEventListener("afterprint", () => (document.title = previous), { once: true });
  window.print();
}
