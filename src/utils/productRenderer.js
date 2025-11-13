import { getProducts } from "../api/productApi";
import { Product } from "../components/product/Product";
import { resetInfiniteScrollState, updateInfiniteScrollState } from "./infiniteScrollState.js";
import { initInfiniteScrollObserver } from "./infiniteScrollObserver.js";
import { loadMoreProducts } from "./infiniteScrollLoader.js";

/**
 * 상품 목록을 렌더링하는 함수 (초기 로드)
 * @param {Object} options - 렌더링 옵션
 * @param {Object} options.params - API 호출 파라미터 (limit, search, category1, category2, sort 등)
 */
export const renderProducts = async ({ params = {} } = {}) => {
  const productListContainer = document.getElementById("product-list-container");

  if (!productListContainer) {
    console.error("product-list-container not found");
    return;
  }

  // 무한 스크롤 상태 초기화
  resetInfiniteScrollState();

  try {
    const response = await getProducts({ ...params, page: 1 });
    const { products, pagination } = response;
    const total = pagination?.total;

    productListContainer.innerHTML = `
      <!-- 상품 개수 정보 -->
      <div class="mb-4 text-sm text-gray-600">
        총 <span class="font-medium text-gray-900">${total}개</span>의 상품
      </div>
      <!-- 상품 그리드 -->
      <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
        ${products?.map((product) => Product({ product })).join("")}
      </div>
      <!-- 상품 무한 스크롤 로딩 인디케이터 -->
      <div class="text-center py-4" id="infinite-scroll-loading">
        <div class="inline-flex items-center" style="visibility: hidden;">
          <svg class="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm text-gray-600">상품을 불러오는 중...</span>
        </div>
      </div>
      <!-- 모든 상품 로드 완료 메시지 -->
      <div class="text-center py-4 text-sm text-gray-500" id="infinite-scroll-completion" style="display: none;">
        모든 상품을 확인했습니다
      </div>
    `;

    // 무한 스크롤 상태 업데이트
    updateInfiniteScrollState({
      currentPage: 1,
      hasNext: pagination.hasNext,
      isLoading: false,
    });

    // 무한 스크롤 초기화
    initInfiniteScroll();
  } catch (error) {
    productListContainer.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div class="text-red-600 mb-2">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-red-900 mb-2">오류가 발생했습니다</h3>
        <p class="text-red-700">${error.message}</p>
        <button onclick="location.reload()" 
                class="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
          다시 시도
        </button>
      </div>
    `;
  }
};

/**
 * 무한 스크롤을 초기화합니다.
 * 옵저버를 설정하고 로딩 트리거를 활성화합니다.
 */
export const initInfiniteScroll = () => {
  // 약간의 딜레이 후 옵저버 초기화 (DOM 완전히 렌더링된 후)
  setTimeout(() => {
    initInfiniteScrollObserver(loadMoreProducts, "#infinite-scroll-loading");
  }, 100);
};
