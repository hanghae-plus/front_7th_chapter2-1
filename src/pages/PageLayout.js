import { Footer } from "../components/Footer.js";
import { Header } from "../components/Header.js";

export const PageLayout = ({ children }) => {
  return /* html */ `
    <div class="min-h-screen bg-gray-50">
      ${Header()}
      <main class="max-w-md mx-auto px-4 py-4">
        ${children}
      </main>
      ${Footer()}
    </div>
  `;
};
