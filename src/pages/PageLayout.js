import { Footer, Header } from "../components";

export const PageLayout = () => {
  return /* html */ `
    <div class="min-h-screen bg-gray-50">
      ${Header()}
      <main id="main-content-view" class="max-w-md mx-auto px-4 py-4">
      </main>
      ${Footer()}
    </div>
  `;
};
