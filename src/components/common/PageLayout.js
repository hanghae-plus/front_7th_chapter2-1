import { Footer } from "./Footer";
import { Header } from "./Header";

export const PageLayout = ({
  children = "",
  header,
  footer,
  wrapperClass = "min-h-screen bg-gray-50",
  mainClass = "max-w-md mx-auto px-4 py-4",
} = {}) => {
  const headerMarkup = header ?? Header();
  const footerMarkup = footer ?? Footer();

  return /*html*/ `
    <div class="${wrapperClass}">
      ${headerMarkup}
      <main class="${mainClass}">
        ${children}
      </main>
      ${footerMarkup}
    </div>
  `;
};
