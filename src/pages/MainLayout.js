import Header from "../components/Header";
import Toast, { showToast } from "../components/Toast";

const MainLayout = () => {
  console.log("MAIN LAYOUT");

  window.addEventListener("cart:add", (e) => {
    console.log("CART ADD", e);
    showToast("장바구니에 추가되었습니다", "success");
  });

  return /*html*/ `
      <div class="min-h-screen bg-gray-50">
        ${Header()}
        <main class="max-w-md mx-auto px-4 py-4">
        <div id="router-view">
        </div>
        </main>
        <footer class="bg-white shadow-sm sticky top-0 z-40">
          <div class="max-w-md mx-auto py-8 text-center text-gray-500">
            <p>© 2025 항해플러스 프론트엔드 쇼핑몰</p>
          </div>
        </footer>
        <div id="notification-container"></div>
        ${Toast()}
      </div>
    `;
};

export default MainLayout;
