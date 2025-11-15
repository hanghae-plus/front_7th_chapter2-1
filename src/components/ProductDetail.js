import { formatNumber } from "../utils/formatter.js";
import createComponent from "../core/component/create-component";
import ProductDetailCounter from "./ProductDetailCounter.js";
import Router from "../core/router/index.js";

const ProductDetail = createComponent({
  id: "product-detail",
  props: { productDetailResponse: null, productDetailListResponse: null },
  eventHandlers: {
    "navigate-to-home": (props, getter, setter, event) => {
      if (!event.target) return;
      Router.push("/");
    },
    "navigate-to-detail": (props, getter, setter, event) => {
      if (!event.target) return;
      const productId = event.target.closest("[data-link]")?.dataset.productId;
      if (!productId) return;
      Router.push(`/product/${productId}`);
    },
    "navigate-to-category": (props, getter, setter, event) => {
      if (!event.target) return;
      const category1 = event.target.closest("[data-link]")?.dataset.category1;
      console.log("[ProductDetail] category1", category1);
      if (!category1) return;
      Router.push(`/?category1=${category1}`);
    },
  },
  templateFn: ({ productDetailResponse, productDetailListResponse }) => {
    const categoryPath = [
      productDetailResponse?.category1,
      productDetailResponse?.category2,
      productDetailResponse?.category3,
      productDetailResponse?.category4,
    ].filter(Boolean);
    console.log("[ProductDetail] categoryPath", categoryPath);
    const {
      productId = "",
      brand = "",
      image = "",
      title = "",
      description = "",
      lprice = 0,
      stock = 0,
      rating = 0,
      reviewCount = 0,
    } = productDetailResponse || {};

    const relatedProducts = productDetailListResponse?.products?.filter((product) => product.productId !== productId);

    return /* HTML */ `
      <main class="max-w-md mx-auto px-4 py-4">
        <!-- 브레드크럼 -->
        <nav class="mb-4">
          <div class="flex items-center space-x-2 text-sm text-gray-600">
            <a href="${Router.basePath}" data-link="" class="hover:text-blue-600 transition-colors">홈</a>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            ${categoryPath
              .map(
                (category, index) => /* HTML */ `
                  <button
                    class="breadcrumb-link"
                    data-link
                    data-link-href="/"
                    data-event="navigate-to-category"
                    data-event-type="click"
                    data-category1="${category}"
                  >
                    ${category}
                  </button>
                  ${index < categoryPath.length - 1
                    ? /* HTML */ `
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      `
                    : ""}
                `,
              )
              .join("")}
          </div>
        </nav>
        <!-- 상품 상세 정보 -->
        <div class="bg-white rounded-lg shadow-sm mb-6">
          <!-- 상품 이미지 -->
          <div class="p-4">
            <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img src="${image}" alt="${title}" class="w-full h-full object-cover product-detail-image" />
            </div>
            <!-- 상품 정보 -->
            <div>
              <p class="text-sm text-gray-600 mb-1">${brand}</p>
              <h1 class="text-xl font-bold text-gray-900 mb-3">${title}</h1>
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
                <span class="ml-2 text-sm text-gray-600">${rating}.0 (${reviewCount}개 리뷰)</span>
              </div>
              <!-- 가격 -->
              <div class="mb-4">
                <span class="text-2xl font-bold text-blue-600">${formatNumber(lprice)}원</span>
              </div>
              <!-- 재고 -->
              <div class="text-sm text-gray-600 mb-4">재고 ${stock}개</div>
              <!-- 설명 -->
              <div class="text-sm text-gray-700 leading-relaxed mb-6">${description}</div>
            </div>
          </div>
          <!-- 수량 선택 및 액션 -->
          ${ProductDetailCounter.mount({ productDetail: productDetailResponse }).outerHTML}
        </div>
        <!-- 상품 목록으로 이동 -->
        <div class="mb-6">
          <button
            class="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md 
        hover:bg-gray-200 transition-colors go-to-product-list"
            data-link
            data-link-href="/"
            data-event="navigate-to-home"
            data-event-type="click"
          >
            상품 목록으로 돌아가기
          </button>
        </div>
        <!-- 관련 상품 -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-4 border-b border-gray-200">
            <h2 class="text-lg font-bold text-gray-900">관련 상품</h2>
            <p class="text-sm text-gray-600">같은 카테고리의 다른 상품들</p>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-2 gap-3 responsive-grid">
              ${(relatedProducts || [])
                .map(
                  (product) => /* HTML */ `
                    <div
                      class="bg-gray-50 rounded-lg p-3 related-product-card cursor-pointer"
                      data-product-id="${product.productId}"
                      data-link
                      data-link-href="/product/${product.productId}"
                      data-event="navigate-to-detail"
                      data-event-type="click"
                    >
                      <div class="aspect-square bg-white rounded-md overflow-hidden mb-2">
                        <img
                          src="${product.image}"
                          alt="${product.title}"
                          class="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">${product.title}</h3>
                      <p class="text-sm font-bold text-blue-600">${formatNumber(product.lprice)}원</p>
                    </div>
                  `,
                )
                .join("")}
            </div>
          </div>
        </div>
      </main>
    `;
  },
});

export default ProductDetail;
