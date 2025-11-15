import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { CartModal } from "../components/CartModal";
import { getCartItems, getSelectedItems } from "../utils/cartStore";
import { isModalOpen } from "../utils/modalStore";

export const PageLayout = ({ children, isDetailPage = false }) => {
  const showModal = isModalOpen();
  const cartItems = showModal ? getCartItems() : [];
  const selectedItems = showModal ? getSelectedItems() : [];

  return /* html */ `
    <div class="min-h-screen bg-gray-50">
        ${Header({ isDetailPage })}
        <main class="max-w-md mx-auto px-4 py-4">
            ${children}
        </main>
        ${Footer()}
        ${showModal ? CartModal({ cartItems, selectedItems }) : ""}
    </div>
    `;
};
