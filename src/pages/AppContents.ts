import { AppHeader, AppFooter } from "@/pages";

const AppContents = ({ children }) => {
  return /* html */ `
    <div class="min-h-screen bg-gray-50">
        ${AppHeader}
        <main class="max-w-md mx-auto px-4 py-4">
            ${children}
        </main>
        ${AppFooter}
    </div>
    `;
};

export { AppContents };
