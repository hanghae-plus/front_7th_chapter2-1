import Footer from "./Footer";
import Header from "./Header";

export default function Layout({ children, cartCount = 0, showBackButton = false, title = "쇼핑몰" }) {
  return /*html*/ `
  <div class="min-h-screen bg-gray-50">
    ${Header({ cartCount, showBackButton, title })}
      <main class="max-w-md mx-auto px-4 py-4">
      ${children}
      </main>
    ${Footer()}
  </div>
  `;
}
