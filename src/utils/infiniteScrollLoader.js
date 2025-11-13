/**
 * 무한 스크롤 로더 모듈
 * 다음 페이지 데이터를 API에서 로드하고 기존 목록에 추가합니다.
 */

import { getProducts } from "../api/productApi.js";
import { Product } from "../components/product/Product.js";
import { getInfiniteScrollState, updateInfiniteScrollState } from "./infiniteScrollState.js";
import { getCurrentFilters } from "./filterState.js";

/**
 * 다음 페이지의 상품들을 로드하고 기존 목록에 추가합니다.
 */
export const loadMoreProducts = async () => {
  const state = getInfiniteScrollState();

  // 이미 로딩 중이거나, 다음 페이지가 없거나, 비활성화된 경우 중단
  if (state.isLoading || !state.hasNext || !state.isEnabled) {
    return;
  }

  // 로딩 상태 설정
  updateInfiniteScrollState({ isLoading: true });

  // 로딩 인디케이터 표시
  showLoadingIndicator();

  try {
    // 현재 필터 상태 가져오기
    const currentFilters = getCurrentFilters();

    // 다음 페이지 번호
    const nextPage = state.currentPage + 1;

    // API 호출
    const response = await getProducts({
      ...currentFilters,
      page: nextPage,
    });

    const { products, pagination } = response;

    // 상품 그리드에 추가
    appendProductsToGrid(products);

    // 상태 업데이트
    updateInfiniteScrollState({
      currentPage: nextPage,
      isLoading: false,
      hasNext: pagination.hasNext,
    });

    // 더 이상 로드할 데이터가 없으면 완료 메시지 표시
    if (!pagination.hasNext) {
      showCompletionMessage();
    }
  } catch (error) {
    console.error("Error loading more products:", error);
    updateInfiniteScrollState({ isLoading: false });
    hideLoadingIndicator();
  }
};

/**
 * 상품들을 그리드에 추가합니다.
 * @param {Array} products - 추가할 상품 배열
 */
const appendProductsToGrid = (products) => {
  const productsGrid = document.getElementById("products-grid");
  if (!productsGrid) {
    console.error("products-grid not found");
    return;
  }

  // 새로운 상품 카드들을 생성하여 추가
  const productsHTML = products.map((product) => Product({ product })).join("");
  productsGrid.insertAdjacentHTML("beforeend", productsHTML);
};

/**
 * 로딩 인디케이터를 표시합니다.
 */
const showLoadingIndicator = () => {
  const loadingElement = document.getElementById("infinite-scroll-loading");
  const completionElement = document.getElementById("infinite-scroll-completion");

  if (loadingElement) {
    const spinner = loadingElement.querySelector(".inline-flex");
    if (spinner) {
      spinner.style.visibility = "visible";
    }
  }
  if (completionElement) {
    completionElement.style.display = "none";
  }
};

/**
 * 로딩 인디케이터를 숨깁니다.
 */
const hideLoadingIndicator = () => {
  const loadingElement = document.getElementById("infinite-scroll-loading");
  if (loadingElement) {
    const spinner = loadingElement.querySelector(".inline-flex");
    if (spinner) {
      spinner.style.visibility = "hidden";
    }
  }
};

/**
 * 모든 상품 로드 완료 메시지를 표시합니다.
 */
const showCompletionMessage = () => {
  const loadingElement = document.getElementById("infinite-scroll-loading");
  const completionElement = document.getElementById("infinite-scroll-completion");

  if (loadingElement) {
    const spinner = loadingElement.querySelector(".inline-flex");
    if (spinner) {
      spinner.style.visibility = "hidden";
    }
  }
  if (completionElement) {
    completionElement.style.display = "block";
  }
};
