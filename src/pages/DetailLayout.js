import { Footer } from "../components/Footer";
import { DetailHeader } from "../components/DetailHeader";

export const DetailLayout = ({ children }) => {
  return `
    <div class="min-h-screen bg-gray-50">
      ${DetailHeader()}
      <main class="max-w-md mx-auto px-4 py-4">
        ${children}
      </main>
      ${Footer()}
    </div>
  `;
};
