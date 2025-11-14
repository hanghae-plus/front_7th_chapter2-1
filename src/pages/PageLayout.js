import { Footer } from "../components/Footer";
import { Header } from "../components/Header";

export const PageLayout = ({ children, title = "쇼핑몰" }) => {
  return /* HTML */ `
    <div class="min-h-screen bg-gray-50">
      ${Header({ title })}
      <main class="max-w-md mx-auto px-4 py-4">${children}</main>
      <div class="cart-modal-container"></div>
      ${Footer()}
    </div>
  `;
};
