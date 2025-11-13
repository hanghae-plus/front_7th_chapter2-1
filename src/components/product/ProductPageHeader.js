import { Component } from "@/core/Component";
import { Router } from "@/core/Router";

const ProductPageHeader = Component({
  template: () => {
    return /* HTML */ `
      <header class="bg-white shadow-sm sticky top-0 z-40">
        <div class="max-w-md mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <button id="back-btn" class="p-2 text-gray-700 hover:text-gray-900 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <h1 class="text-lg font-bold text-gray-900">상품 상세</h1>
            </div>
          </div>
        </div>
      </header>
    `;
  },

  setEvent: ({ addEvent }) => {
    const router = Router();

    // 뒤로가기 버튼
    addEvent("#back-btn", "click", () => {
      router.push("/");
    });
  },
});

export default ProductPageHeader;
