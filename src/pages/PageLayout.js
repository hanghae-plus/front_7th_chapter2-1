import { Header, Footer, Toast } from "../components/index.js";
export const PageLayout = (children, title = "쇼핑몰") => {
  return /*html*/ `
    <div class="min-h-screen bg-gray-50">
        ${Header(title)}
        <main class="max-w-md mx-auto px-4 py-4">
            ${children}
        </main>
        ${Footer()}
        ${Toast()}
    </div>
        `;
};
