import { store } from "../../store";
import { addBasePath } from "../utils/urlUtils.js";

export const Breadcrumb = () => {
  const currentProduct = store.state.currentProduct || {};
  const { category1, category2 } = currentProduct;

  // 상품 상세 페이지에서만 브레드크럼 표시
  if (!category1 && !category2) {
    return "";
  }

  const homePath = addBasePath("/");

  return `
  <!-- 브레드크럼 -->
  <nav class="mb-4">
    <div class="flex items-center space-x-2 text-sm text-gray-600">
      <a href="${homePath}" data-link="" class="hover:text-blue-600 transition-colors">홈</a>
      ${
        category1
          ? `
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
      </svg>
      <button class="breadcrumb-link hover:text-blue-600 transition-colors cursor-pointer" data-category1="${category1}">
        ${category1}
      </button>
      `
          : ""
      }
      ${
        category2
          ? `
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
      </svg>
      <button class="breadcrumb-link hover:text-blue-600 transition-colors cursor-pointer" data-category2="${category2}">
        ${category2}
      </button>
      `
          : ""
      }
    </div>
  </nav>
  `;
};
