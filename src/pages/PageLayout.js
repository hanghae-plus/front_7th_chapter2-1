import { Header, Footer } from "../components";

export const PageLayout = ({ children, pageType }) => {
  return `
    <div class="min-h-screen bg-gray-50">
      ${Header(pageType)}
      <main class="max-w-md mx-auto px-4 py-4">
        ${children}
      </main>
     ${Footer()}
    </div>
  `;
};
