import { withLifecycle } from "../core/lifecycle.js";
import * as router from "../core/router.js";
import { store } from "../state/store.js";
import { getProduct, getProducts } from "../api/productApi.js";
import { Footer } from "../components/Footer.js";
import { showToast } from "../utils/toast.js";

/**
 * 상품 상세 정보 로드
 */
async function loadProductDetail(productId) {
  store.dispatch({ type: "pendingProduct" });

  try {
    const product = await getProduct(productId);
    store.dispatch({ type: "setProduct", payload: product });

    // 관련 상품 로드 (같은 category2, 현재 상품 제외)
    loadRelatedProducts(product.category2, productId);
  } catch (error) {
    store.dispatch({ type: "errorProduct", payload: error });
    showToast("상품을 불러올 수 없습니다", "error");
  }
}

/**
 * 관련 상품 로드
 */
async function loadRelatedProducts(category2, excludeProductId) {
  try {
    const data = await getProducts({ category2, limit: 10 });
    // 현재 상품 제외
    const relatedProducts = data.products.filter((p) => p.productId !== excludeProductId);

    store.dispatch({ type: "setRelatedProducts", payload: relatedProducts });
  } catch (error) {
    console.error("관련 상품 로드 실패:", error);
  }
}

/**
 * DetailPage - withLifecycle 적용
 */
export const DetailPage = withLifecycle(
  {
    // 컴포넌트 초기화 시 1번만 실행
    mount() {
      const { id } = router.getCurrentRoute().params;
      loadProductDetail(id);

      // 재시도 버튼 이벤트 리스너
      document.addEventListener("click", (e) => {
        if (e.target.id === "detail-retry-btn") {
          const currentId = router.getCurrentRoute().params.id;
          loadProductDetail(currentId);
        }
      });
    },

    // URL 파라미터 변경 감지 (관련 상품 클릭 시)
    watchs: [
      {
        target() {
          return router.getCurrentRoute().params.id;
        },
        callback(newId) {
          loadProductDetail(newId);
        },
      },
    ],
  },

  // 렌더링 함수
  () => {
    const { product, loading, relatedProducts, error } = store.getState().detail;
    const cart = store.getState().cart;
    const cartCount = cart.length;

    return /* HTML */ `
      <div class="min-h-screen bg-gray-50">
        <!-- 상세 페이지 헤더 -->
        <header class="bg-white shadow-sm sticky top-0 z-40">
          <div class="max-w-md mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <button onclick="window.history.back()" class="p-2 text-gray-700 hover:text-gray-900 transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                <h1 class="text-lg font-bold text-gray-900">상품 상세</h1>
              </div>
              <div class="flex items-center space-x-2">
                <!-- 장바구니 아이콘 -->
                <button id="cart-icon-btn" class="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"
                    ></path>
                  </svg>
                  ${cartCount > 0
                    ? /* HTML */ `
                        <span
                          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold
                     rounded-full h-5 w-5 flex items-center justify-center"
                        >
                          ${cartCount}
                        </span>
                      `
                    : ""}
                </button>
              </div>
            </div>
          </div>
        </header>

        ${error
          ? /* HTML */ `
              <main class="max-w-md mx-auto px-4 py-4">
                <div class="text-center my-4 py-20 shadow-md p-6 bg-white rounded-lg">
                  <svg
                    class="w-16 h-16 mx-auto mb-4 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    ></path>
                  </svg>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">상품 정보를 불러올 수 없습니다</h3>
                  <p class="text-sm text-gray-600 mb-4">네트워크 연결을 확인해주세요</p>
                  <button
                    id="detail-retry-btn"
                    class="inline-block px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              </main>
            `
          : loading
            ? /* HTML */ `
                <main class="max-w-md mx-auto px-4 py-4">
                  <div class="py-20 bg-gray-50 flex items-center justify-center">
                    <div class="text-center">
                      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p class="text-gray-600">상품 정보를 불러오는 중...</p>
                    </div>
                  </div>
                </main>
              `
            : /* HTML */ ` <main class="max-w-md mx-auto px-4 py-4">
                <!-- 브레드크럼 -->
                <nav class="mb-4">
                  <div class="flex items-center space-x-2 text-sm text-gray-600">
                    <a href="/" data-link="" class="hover:text-blue-600 transition-colors">홈</a>
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                    <button class="breadcrumb-link" data-category1="${product.category1}">${product.category1}</button>
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                    <button class="breadcrumb-link" data-category2="${product.category2}">${product.category2}</button>
                  </div>
                </nav>
                <!-- 상품 상세 정보 -->
                <div class="bg-white rounded-lg shadow-sm mb-6">
                  <!-- 상품 이미지 -->
                  <div class="p-4">
                    <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                      <img
                        src="${product.image}"
                        alt="${product.title}"
                        class="w-full h-full object-cover product-detail-image"
                      />
                    </div>
                    <!-- 상품 정보 -->
                    <div>
                      <p class="text-sm text-gray-600 mb-1"></p>
                      <h1 class="text-xl font-bold text-gray-900 mb-3">${product.title}</h1>
                      <!-- 평점 및 리뷰 -->
                      <div class="flex items-center mb-3">
                        <div class="flex items-center">
                          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            ></path>
                          </svg>
                          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            ></path>
                          </svg>
                          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            ></path>
                          </svg>
                          <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            ></path>
                          </svg>
                          <svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            ></path>
                          </svg>
                        </div>
                        <span class="ml-2 text-sm text-gray-600"
                          >${product.rating} (${product.reviewCount}개 리뷰)</span
                        >
                      </div>
                      <!-- 가격 -->
                      <div class="mb-4">
                        <span class="text-2xl font-bold text-blue-600"
                          >${Number(product.lprice).toLocaleString()}원</span
                        >
                      </div>
                      <!-- 재고 -->
                      <div class="text-sm text-gray-600 mb-4">재고 ${product.stock}개</div>
                      <!-- 설명 -->
                      <div class="text-sm text-gray-700 leading-relaxed mb-6">${product.description}</div>
                    </div>
                  </div>
                  <!-- 수량 선택 및 액션 -->
                  <div class="border-t border-gray-200 p-4">
                    <div class="flex items-center justify-between mb-4">
                      <span class="text-sm font-medium text-gray-900">수량</span>
                      <div class="flex items-center">
                        <button
                          id="quantity-decrease"
                          class="w-8 h-8 flex items-center justify-center border border-gray-300
               rounded-l-md bg-gray-50 hover:bg-gray-100"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                          </svg>
                        </button>
                        <input
                          type="number"
                          id="quantity-input"
                          value="1"
                          min="1"
                          max="${product.stock}"
                          class="w-16 h-8 text-center text-sm border-t border-b border-gray-300
              focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          id="quantity-increase"
                          class="w-8 h-8 flex items-center justify-center border border-gray-300
               rounded-r-md bg-gray-50 hover:bg-gray-100"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 4v16m8-8H4"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <!-- 액션 버튼 -->
                    <button
                      id="add-to-cart-btn"
                      data-product-id="${product.productId}"
                      class="w-full bg-blue-600 text-white py-3 px-4 rounded-md
             hover:bg-blue-700 transition-colors font-medium"
                    >
                      장바구니 담기
                    </button>
                  </div>
                </div>
                <!-- 상품 목록으로 이동 -->
                <div class="mb-6">
                  <button
                    class="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md
        hover:bg-gray-200 transition-colors go-to-product-list"
                  >
                    상품 목록으로 돌아가기
                  </button>
                </div>
                <!-- 관련 상품 -->
                ${relatedProducts && relatedProducts.length > 0
                  ? /* HTML */ `
                      <div class="bg-white rounded-lg shadow-sm">
                        <div class="p-4 border-b border-gray-200">
                          <h2 class="text-lg font-bold text-gray-900">관련 상품</h2>
                          <p class="text-sm text-gray-600">같은 카테고리의 다른 상품들</p>
                        </div>
                        <div class="p-4">
                          <div class="grid grid-cols-2 gap-3 responsive-grid">
                            ${relatedProducts
                              .map(
                                (relatedProduct) => /* HTML */ `
                                  <div
                                    class="bg-gray-50 rounded-lg p-3 related-product-card cursor-pointer"
                                    data-product-id="${relatedProduct.productId}"
                                  >
                                    <div class="aspect-square bg-white rounded-md overflow-hidden mb-2">
                                      <img
                                        src="${relatedProduct.image}"
                                        alt="${relatedProduct.title}"
                                        class="w-full h-full object-cover"
                                        loading="lazy"
                                      />
                                    </div>
                                    <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                                      ${relatedProduct.title}
                                    </h3>
                                    <p class="text-sm font-bold text-blue-600">
                                      ${Number(relatedProduct.lprice).toLocaleString()}원
                                    </p>
                                  </div>
                                `,
                              )
                              .join("")}
                          </div>
                        </div>
                      </div>
                    `
                  : ""}
              </main>`}
        ${Footer()}
      </div>
    `;
  },
);
