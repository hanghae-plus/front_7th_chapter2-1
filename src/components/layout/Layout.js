import { Header } from "./Header.js";
import { Footer } from "./Footer.js";

export const Layout = ({ top = "", main = "", bottom = "", headerProps = {} }) => {
  return /*html*/ `
    <div class="min-h-screen bg-gray-50">
        ${Header(headerProps)}
        <main class="max-w-md mx-auto px-4 py-4">
            ${top}
            ${main}
            ${bottom}
        </main>
        ${Footer()}
    </div>
  `;
};
