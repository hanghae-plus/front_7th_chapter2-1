import { getProducts } from "../api/productApi.js";
import { renderProductItems } from "../components/ProductList.js";
import { appendHomepageProducts, getHomepageState, setHomepageLoadingMore } from "../store/appStore.js";
import { eventBus } from "../utils/EventBus.js";

const updateSentinel = ({ loading, hasNext, nextPage, message, error }) => {
  const sentinel = document.querySelector("[data-infinite-trigger]");
  if (!sentinel) {
    return;
  }

  if (loading !== undefined) {
    sentinel.dataset.loading = loading ? "true" : "false";
  }

  if (hasNext !== undefined) {
    sentinel.dataset.hasNext = hasNext ? "true" : "false";
  }

  if (nextPage !== undefined) {
    sentinel.dataset.nextPage = String(nextPage);
  }

  if (error) {
    sentinel.innerHTML = `
      <button type="button" class="text-xs text-red-500 underline" data-infinite-retry>
        상품을 불러오지 못했습니다. 다시 시도하기
      </button>
    `;
    return;
  }

  if (message) {
    sentinel.innerHTML = `<span class="text-xs text-gray-500">${message}</span>`;
  }
};

const handleFiltersChange = (router) => (params) => {
  const searchParams = params instanceof URLSearchParams ? params : new URLSearchParams(params);
  const search = searchParams.toString();
  const url = search ? `/?${search}` : "/";
  router.push(url);
};

const handleProductsLoadMore = async () => {
  const homepageState = getHomepageState();

  if (homepageState.isLoadingMore) {
    return;
  }

  const pagination = homepageState.pagination;
  if (!pagination || !pagination.hasNext) {
    updateSentinel({
      loading: false,
      hasNext: false,
      message: "모든 상품을 불러왔습니다",
    });
    return;
  }

  setHomepageLoadingMore(true);

  const nextPage = Number(pagination.page ?? 1) + 1;
  const params = {
    ...homepageState.filters,
    page: nextPage,
  };

  updateSentinel({
    loading: true,
    nextPage,
  });

  try {
    const data = await getProducts(params);
    const newProducts = Array.isArray(data?.products) ? data.products : [];
    const updatedPagination = data?.pagination ?? {
      ...pagination,
      page: nextPage,
      hasNext: false,
    };

    if (newProducts.length) {
      const grid = document.querySelector("#products-grid");
      if (grid) {
        grid.insertAdjacentHTML("beforeend", renderProductItems(newProducts));
      }
    }

    appendHomepageProducts(newProducts, updatedPagination);

    updateSentinel({
      loading: false,
      hasNext: updatedPagination.hasNext,
      nextPage: (updatedPagination.page ?? nextPage) + 1,
      message: updatedPagination.hasNext ? "아래로 스크롤하면 더 많은 상품을 불러옵니다" : "모든 상품을 불러왔습니다",
    });
  } catch (error) {
    console.error("상품 추가 로딩에 실패했습니다.", error);
    updateSentinel({
      loading: false,
      error: true,
    });
  } finally {
    setHomepageLoadingMore(false);
  }
};

const handleDocumentClick = (router) => (event) => {
  const cartIconButton = event.target.closest("#cart-icon-btn");
  if (cartIconButton) {
    const cartModal = document.querySelector("#cart-modal");
    if (!cartModal) {
      return;
    }

    const isHidden = cartModal.classList.toggle("hidden");
    cartModal.setAttribute("aria-hidden", isHidden ? "true" : "false");

    return;
  }

  const cartModalCloseButton = event.target.closest("#cart-modal-close-btn");
  if (cartModalCloseButton) {
    const cartModal = document.querySelector("#cart-modal");
    if (!cartModal) {
      return;
    }

    const isHidden = cartModal.classList.toggle("hidden");
    cartModal.setAttribute("aria-hidden", isHidden ? "true" : "false");

    return;
  }

  const addToCartButton = event.target.closest(".add-to-cart-btn");
  if (addToCartButton) {
    const productId = addToCartButton.dataset.productId;
    if (!productId) {
      return;
    }

    console.log(productId);
    return;
  }

  const card = event.target.closest(".product-card");
  if (card) {
    const productId = card.dataset.productId;
    if (!productId) {
      return;
    }

    router.push(`/products/${productId}`);
  }
};

export const registerHomepageEvents = (router) => {
  eventBus.on("filters:change", handleFiltersChange(router));
  eventBus.on("products:loadMore", handleProductsLoadMore);
  document.body.addEventListener("click", handleDocumentClick(router));
};
