import { store } from "../../store";
import { ErrorState } from "./ErrorState";
import { formatPrice, formatNumber } from "../utils/stringUtils.js";

/**
 * 로딩 스켈레톤 렌더링
 */
const renderSkeleton = (count = 2) => {
  const skeletonItem = `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div class="aspect-square bg-gray-200"></div>
      <div class="p-3">
        <div class="h-4 bg-gray-200 rounded mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div class="h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  `;

  return skeletonItem.repeat(count);
};

/**
 * 로딩 인디케이터 렌더링
 */
const renderLoadingIndicator = () => {
  return `
    <div class="text-center py-4">
      <div class="inline-flex items-center">
        <svg class="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm text-gray-600">상품을 불러오는 중...</span>
      </div>
    </div>
  `;
};

/**
 * 상품 아이템 렌더링
 */
const renderProductItem = (product) => {
  const { productId, image, title, brand, lprice } = product;

  return `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col product-card"
      data-product-id="${productId}">
      <!-- 상품 이미지 -->
      <div class="aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
        <img src="${image}"
          alt="${title}"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          loading="lazy">
      </div>
      <!-- 상품 정보 -->
      <div class="p-3 flex flex-col justify-between flex-1">
        <div class="cursor-pointer product-info mb-3">
          <h3 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
            ${title}
          </h3>
          <p class="text-xs text-gray-500 mb-2 h-4">${brand || ""}</p>
          <p class="text-lg font-bold text-gray-900">
            ${formatPrice(lprice)}
          </p>
        </div>
        <!-- 장바구니 버튼 -->
        <button class="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md
          hover:bg-blue-700 transition-colors mt-auto add-to-cart-btn" data-product-id="${productId}">
          장바구니 담기
        </button>
      </div>
    </div>
  `;
};

/**
 * 상품 그리드 렌더링
 */
const renderProductGrid = (products) => {
  if (!products || products.length === 0) {
    return "";
  }

  return `
    <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
      ${products.map((product) => renderProductItem(product)).join("")}
    </div>
  `;
};

/**
 * 상품 개수 정보 렌더링
 */
const renderProductCount = (total) => {
  return `
    <div class="mb-4 text-sm text-gray-600">
      총 <span class="font-medium text-gray-900">${formatNumber(total)}개</span>의 상품
    </div>
  `;
};

/**
 * 검색 결과 없음 메시지 렌더링
 */
const renderNoSearchResults = () => {
  return `
    <div class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">상품을 찾을 수 없습니다</h3>
      <p class="text-gray-600">다른 검색어를 시도해보세요.</p>
    </div>
  `;
};

/**
 * 무한 스크롤 트리거 또는 완료 메시지 렌더링
 */
const renderScrollTrigger = (isLoadingMore, hasMore, total, hasSearch) => {
  if (isLoadingMore) {
    return `
      <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid-loading">
        ${renderSkeleton(2)}
      </div>
      ${renderLoadingIndicator()}
    `;
  }

  if (hasMore) {
    return `<div id="scroll-trigger" class="h-4"></div>`;
  }

  // 검색 결과가 없을 때
  if (hasSearch && total === 0) {
    return renderNoSearchResults();
  }

  // 모든 상품을 확인했을 때
  return `
    <div class="text-center py-4 text-sm text-gray-500">
      모든 상품을 확인했습니다
    </div>
  `;
};

export const ProductList = () => {
  const { isLoaded, products, error, isLoadingMore, hasMore, search } = store.state;

  // 에러 상태
  if (error && !isLoaded) {
    return ErrorState();
  }

  // 로딩 상태
  if (!isLoaded) {
    return `
      <div class="mb-6">
        <div>
          <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
            ${renderSkeleton(2)}
          </div>
          ${renderLoadingIndicator()}
        </div>
      </div>
    `;
  }

  // 로드 완료 상태
  const productList = products?.products || [];
  const total = products?.pagination?.total || 0;
  const hasSearch = search && search.trim().length > 0;

  // 검색 결과가 없을 때 (검색어가 있고 상품이 0개)
  if (hasSearch && total === 0 && productList.length === 0) {
    return `
      <div class="mb-6">
        <div>
          ${renderNoSearchResults()}
        </div>
      </div>
    `;
  }

  return `
    <div class="mb-6">
      <div>
        ${renderProductCount(total)}
        ${renderProductGrid(productList)}
        ${renderScrollTrigger(isLoadingMore, hasMore, total, hasSearch)}
      </div>
    </div>
  `;
};
