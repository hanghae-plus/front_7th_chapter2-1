import { Footer, Header } from "@/components/layout";

export function Layout() {
  return html`
    <div class="min-h-screen bg-gray-50">
      ${Header()}
      <main class="max-w-md mx-auto px-4 py-4"></main>
      <div>${Footer()}</div>
    </div>
  `;
}
