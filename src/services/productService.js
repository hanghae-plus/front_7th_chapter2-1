import { getProducts, getProduct } from "../api/productApi.js";
import { state } from "../state/appState.js";
import { createInitialDetailState } from "../state/appState.js";
import { INITIAL_LOAD_ERROR_MESSAGE, LOAD_MORE_ERROR_MESSAGE, DETAIL_LOAD_ERROR_MESSAGE } from "../utils/constants.js";

/**
 * 초기 로딩을 시작합니다.
 * @param {Function} onRender - 렌더링 콜백
 * @returns {Object|null} 다음 페이지 정보 또는 null
 */
export function startInitialLoad(onRender) {
  if (state.isLoadingProducts) {
    return null;
  }

  state.isLoadingProducts = true;
  state.productsError = null;
  state.loadMoreError = null;
  state.currentPage = 0;
  state.products = [];
  state.hasMoreProducts = true;
  state.totalProducts = 0;
  if (onRender) {
    onRender();
  }

  return { nextPage: 1 };
}

/**
 * 추가 로딩을 시작합니다.
 * @param {Function} onRender - 렌더링 콜백
 * @returns {Object|null} 다음 페이지 정보 또는 null
 */
export function startAppendLoad(onRender) {
  if (state.route?.name !== "home" || state.isLoadingProducts || state.isLoadingMore || !state.hasMoreProducts) {
    return null;
  }

  state.isLoadingMore = true;
  state.loadMoreError = null;
  if (onRender) {
    onRender();
  }

  return { nextPage: state.currentPage + 1 };
}

/**
 * 상품 페이지를 가져옵니다.
 * @param {number} page - 페이지 번호
 * @returns {Promise<Object>} 상품 데이터
 */
export async function fetchProductPage(page) {
  const params = {
    limit: state.limit,
    page,
    sort: state.sort,
    ...(state.selectedCategory1 ? { category1: state.selectedCategory1 } : {}),
    ...(state.selectedCategory2 ? { category2: state.selectedCategory2 } : {}),
    ...(state.searchTerm ? { search: state.searchTerm } : {}),
  };

  // API 호출 파라미터 콘솔 로그
  console.log("🔍 API 호출:", params);

  const result = await getProducts(params);

  // API 응답 콘솔 로그
  console.log("📥 API 응답:", {
    productsCount: result?.products?.length ?? 0,
    totalCount: result?.pagination?.total ?? 0,
    page: result?.pagination?.page ?? 0,
  });

  return result;
}

/**
 * 상품 응답을 적용합니다.
 * @param {Object} data - 상품 데이터
 * @param {Object} options - 옵션
 * @param {boolean} options.append - 추가 모드
 * @param {number} options.requestedPage - 요청한 페이지
 * @param {Function} updateHomeUrlParams - URL 업데이트 콜백
 */
export function applyProductResponse(data, { append, requestedPage }, updateHomeUrlParams) {
  const incomingProducts = data?.products ?? [];
  const resolvedPage = data?.pagination?.page ?? requestedPage;
  const hasNext = data?.pagination?.hasNext ?? incomingProducts.length >= state.limit;
  const totalCount = data?.pagination?.total;

  state.products = append ? [...state.products, ...incomingProducts] : incomingProducts;
  state.currentPage = resolvedPage;
  state.hasMoreProducts = hasNext;
  if (typeof totalCount === "number") {
    state.totalProducts = totalCount;
  } else if (!append) {
    state.totalProducts = state.products.length;
  }

  // 총 상품 개수 콘솔 로그
  console.log("📦 총 상품 개수 업데이트:", state.totalProducts, "개", {
    category1: state.selectedCategory1,
    category2: state.selectedCategory2,
    search: state.searchTerm,
    products: state.products.length,
    totalFromAPI: totalCount,
  });

  if (state.route?.name === "home" && updateHomeUrlParams) {
    updateHomeUrlParams({
      current: state.currentPage,
      category1: state.selectedCategory1,
      category2: state.selectedCategory2,
      force: true, // 무한 스크롤 시에도 current를 URL에 표시
    });
  }
}

/**
 * 로딩 에러를 처리합니다.
 * @param {boolean} append - 추가 모드
 */
export function handleLoadError(append) {
  if (append) {
    state.loadMoreError = LOAD_MORE_ERROR_MESSAGE;
    return;
  }

  state.productsError = INITIAL_LOAD_ERROR_MESSAGE;
}

/**
 * 로딩을 완료합니다.
 * @param {boolean} append - 추가 모드
 * @param {Function} onRender - 렌더링 콜백
 */
export function finishLoad(append, onRender) {
  if (append) {
    state.isLoadingMore = false;
  } else {
    state.isLoadingProducts = false;
  }

  if (onRender) {
    onRender();
  }
}

/**
 * 상품 목록을 로드합니다.
 * @param {Object} options - 옵션
 * @param {boolean} options.append - 추가 모드
 * @param {Function} onRender - 렌더링 콜백
 * @param {Function} onShowToast - 토스트 표시 콜백
 * @param {Function} updateHomeUrlParams - URL 업데이트 콜백
 */
export async function loadProducts({ append = false } = {}, onRender, onShowToast, updateHomeUrlParams) {
  if (state.route?.name !== "home") {
    return;
  }

  const context = append ? startAppendLoad(onRender) : startInitialLoad(onRender);
  if (!context) {
    return;
  }

  const { nextPage } = context;

  try {
    const data = await fetchProductPage(nextPage);
    applyProductResponse(data, { append, requestedPage: nextPage }, updateHomeUrlParams);
  } catch (error) {
    console.error("상품 목록을 불러오지 못했습니다.", error);
    handleLoadError(append);
    if (onShowToast) {
      onShowToast();
    }
  } finally {
    finishLoad(append, onRender);
  }
}

/**
 * 상품 상세 정보를 로드합니다.
 * @param {string} productId - 상품 ID
 * @param {Function} onRender - 렌더링 콜백
 * @param {Function} onShowToast - 토스트 표시 콜백
 */
export async function loadProductDetail(productId, onRender, onShowToast) {
  state.detail = createInitialDetailState();
  state.detail.isLoading = true;
  if (onRender) {
    onRender();
  }

  try {
    const product = await getProduct(productId);
    if (state.route?.name !== "detail" || state.route.params.productId !== productId) {
      return;
    }

    let relatedProducts = [];
    try {
      if (product.category1) {
        const relatedResponse = await getProducts({
          limit: 12,
          category1: product.category1,
          ...(product.category2 ? { category2: product.category2 } : {}),
        });
        relatedProducts = (relatedResponse?.products ?? [])
          .filter((item) => item.productId !== product.productId)
          .slice(0, 4);
      }
    } catch (relatedError) {
      console.error("관련 상품을 불러오지 못했습니다.", relatedError);
      relatedProducts = [];
    }

    state.detail.product = {
      ...product,
      relatedProducts,
    };
  } catch (error) {
    if (state.route?.name !== "detail" || state.route.params.productId !== productId) {
      return;
    }
    console.error("상품 상세 정보를 불러오지 못했습니다.", error);
    state.detail.error = DETAIL_LOAD_ERROR_MESSAGE;
    if (onShowToast) {
      onShowToast();
    }
  } finally {
    if (state.route?.name === "detail" && state.route.params.productId === productId) {
      state.detail.isLoading = false;
      if (onRender) {
        onRender();
      }
    }
  }
}
