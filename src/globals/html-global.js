// Ensure a global `html` tagged template is available (for prettier-plugin-html-template-literals)
if (typeof window !== "undefined" && typeof window.html === "undefined") {
  window.html = String.raw;
}

export {};
