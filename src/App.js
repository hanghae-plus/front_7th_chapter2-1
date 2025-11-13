import { router } from "./router/Router.js";
import { store } from "./store/store.js";

import { Header } from "./components/Header.js";
import { Modal } from "./components/Modal.js";
import { Toast } from "./components/Toast.js";
import { Footer } from "./components/Footer.js";

export default function App() {
  // 현재 라우트
  const { path, render } = router.getCurrentRoute();
  const { cart, toast } = store.getState();

  return /*html*/ `
    <div class="min-h-screen bg-gray-50"> 
      ${Header({ path })}
      <main class="max-w-md mx-auto px-4 py-4">
        ${cart.isOpen ? Modal() : ""}
        ${render()}
        </main>
        ${toast.isOpen ? Toast() : ""}
      ${Footer()}
    </div>
  `;
}
