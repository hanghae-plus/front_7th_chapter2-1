import { store } from "../../store.js";
import { CartModal, Footer, Header, Toast } from "../components/index.js";

export const Layout = ({ children }) => {
  const toasState = store.state.toastState;

  return `
    <div class="min-h-screen bg-gray-50">
      ${Header()}
      <main class="max-w-md mx-auto px-4 py-4">
        ${children}
      </main>
      ${toasState && Toast()}
      ${CartModal()}
      ${Footer()}
    </div>
  `;
};
