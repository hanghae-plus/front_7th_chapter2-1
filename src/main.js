import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { CartModal, renderCartModal } from "./components/CartModal.js";
import { Loading, ProductItem } from "./components/ProductList.js";
import { DetailPage } from "./pages/DetailPage.js";
import { HomePage } from "./pages/HomePage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { PageLayout } from "./pages/PageLayout.js";
import { storedData, updateCartCount } from "./utils/storedData.js";
import { getQueryParams } from "./utils/getQueryParams.js";
import { showToast } from "./utils/showToast.js";
import { cartState } from "./state/cartState.js";
import { ADD_CART_LIST, getLocalStorage, setLocalStorage } from "./utils/localstorage.js";
import { ErrorUI } from "./pages/ErrorUI.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
      onUnhandledRequest: "bypass",
    }),
  );

// 무한 스크롤 상태를 전역 변수로 관리합니다.
let globalObserver = null;
let isLoading = false;
let current = 1;

const push = (path) => {
  history.pushState(null, null, path);
  render();
};

const closeCartModal = () => {
  const cartModal = document.querySelector(".cart-modal");
  if (cartModal) {
    cartModal.remove();
    document.removeEventListener("keydown", handleCartModalEscape);
  }
};

const handleCartModalEscape = (e) => {
  if (e.key === "Escape") {
    closeCartModal();
  }
};

// 무한 스크롤 초기화 함수
const resetInfiniteScroll = () => {
  current = 1;
  isLoading = false;
  if (globalObserver) {
    globalObserver.disconnect();
    globalObserver = null;
  }
};

// 무한 스크롤 설정 함수
const setupInfiniteScroll = () => {
  const { category1, category2, search, limit, sort } = getQueryParams();
  const observerElement = document.querySelector("#observer");

  if (!observerElement) return;

  globalObserver = new IntersectionObserver(
    async (entries) => {
      const firstEntry = entries[0];

      if (firstEntry.isIntersecting && !isLoading) {
        isLoading = true;
        current += 1;
        observerElement.innerHTML = Loading;

        try {
          const newData = await getProducts({
            category1,
            category2,
            search,
            limit,
            sort,
            current,
          });

          if (newData.products && newData.products.length > 0) {
            const newProductsHtml = newData.products.map(ProductItem).join("");
            const productGrid = document.querySelector("#products-grid");

            if (productGrid) {
              productGrid.insertAdjacentHTML("beforeend", newProductsHtml);
            }

            observerElement.innerHTML = "";
            isLoading = false;
          } else {
            if (globalObserver) globalObserver.disconnect();
            observerElement.innerHTML =
              "<div class='text-center py-4 text-sm text-gray-500'>모든 상품을 확인했습니다</div>";
          }
        } catch (error) {
          console.error(error);
          observerElement.innerHTML = `<div class='text-center py-4 text-sm text-red-500'>상품을 불러오는 데 실패했습니다.</div>`;
          if (globalObserver) globalObserver.disconnect();
        }
      }
    },
    {
      root: null,
      rootMargin: "0px 0px 50px 0px",
      threshold: 0.1,
    },
  );

  globalObserver.observe(observerElement);
};

// 홈페이지 이벤트 리스너 등록 함수
const setupHomePageEvents = () => {
  const { searchParams } = getQueryParams();

  // 검색 폼
  const searchBar = document.querySelector("#search-input");
  const searchForm = document.querySelector("#search-form");

  if (searchBar) {
    searchBar.addEventListener("change", (e) => {
      searchBar.value = e.target.value;
    });
  }

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      searchParams.set("search", searchBar.value);
      push(`?${searchParams}`);
    });
  }

  // 개수 선택
  const limitSelect = document.querySelector("#limit-select");
  if (limitSelect) {
    const limit = searchParams.get("limit");
    if (limit) limitSelect.value = limit;

    limitSelect.addEventListener("change", (e) => {
      searchParams.set("limit", String(e.target.value));
      push(`?${searchParams}`);
    });
  }

  // 정렬 선택
  const sortSelect = document.querySelector("#sort-select");
  if (sortSelect) {
    const sort = searchParams.get("sort");
    if (sort) sortSelect.value = sort;

    sortSelect.addEventListener("change", (e) => {
      searchParams.set("sort", e.target.value);
      push(`?${searchParams}`);
    });
  }
};

// 홈페이지 렌더링 함수
const renderHomePage = async () => {
  const $root = document.querySelector("#root");
  const { category1, category2, search, limit, sort } = getQueryParams();

  // 무한 스크롤 상태 초기화
  resetInfiniteScroll();

  $root.innerHTML = HomePage({ loading: true });

  try {
    // 데이터 페칭
    const data = await getProducts({
      category1,
      category2,
      search,
      limit,
      sort,
      current: 1,
    });
    const categories = await getCategories();

    $root.innerHTML = HomePage({ ...data, loading: false, categories, pageTitle: "쇼핑몰" });

    // 이벤트 리스너 등록
    setupHomePageEvents();

    // 무한 스크롤 설정
    setupInfiniteScroll();
  } catch (error) {
    console.error(error);

    const productGrid = document.querySelector("#products-grid");
    const observerElement = document.querySelector("#observer");

    if (productGrid) {
      productGrid.classList.remove("grid", "grid-cols-2", "gap-4");
      productGrid.innerHTML = ErrorUI("productList");
    }
    if (observerElement) {
      observerElement.innerHTML = "";
    }

    const retryButton = document.querySelector("#retry-btn");
    if (retryButton) {
      retryButton.addEventListener("click", () => renderHomePage());
    }
    // ⬆️
  }
};

// 상세 페이지 렌더링 함수
const renderDetailPage = async () => {
  const $root = document.querySelector("#root");

  $root.innerHTML = DetailPage({ loading: true, pageTitle: "상품 상세" });

  try {
    // 데이터 페칭
    const productId = location.pathname.split("/").pop();
    const data = await getProduct(productId);

    let responsiveList = [];
    try {
      const responsiveData = await getProducts({
        category1: data.category1,
        category2: data.category2,
      });
      responsiveList = responsiveData.products;
    } catch (relatedError) {
      console.warn("Could not fetch related products:", relatedError);
    }

    // 최종 렌더링
    $root.innerHTML = DetailPage({
      pageTitle: "상품 상세",
      loading: false,
      product: data,
      responsiveList: responsiveList,
    });
  } catch (error) {
    console.error("Failed to render detail page:", error);

    const detailErrorUI = /* HTML */ `
      <div class="py-20 flex items-center justify-center">
        <div class="text-center">
          <div class="text-red-500 mb-4">
            <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              ></path>
            </svg>
          </div>
          <h1 class="text-xl font-bold text-gray-900 mb-2">상품을 찾을 수 없습니다</h1>
          <p class="text-gray-600 mb-4">Failed to fetch</p>
          <button
            onclick="window.history.back()"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-2"
          >
            이전 페이지
          </button>
          <a href="/" data-link="" class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"> 홈으로 </a>
        </div>
      </div>
    `;

    $root.innerHTML = PageLayout({
      pageTitle: "상품을 찾을 수 없음",
      children: detailErrorUI,
    });
  }
};

// 404 페이지 렌더링 함수
const renderNotFoundPage = () => {
  const $root = document.querySelector("#root");
  $root.innerHTML = NotFoundPage();
};

// 라우팅 담당 render 함수
const render = async () => {
  const basePath = import.meta.env.BASE_URL;
  const pathName = location.pathname;
  const relativePath = pathName.replace(basePath, "/").replace(/\/$/, "") || "/";

  const $root = document.querySelector("#root");
  if (!$root) return;

  try {
    if (relativePath === "/") {
      await renderHomePage();
    } else if (relativePath.startsWith("/product")) {
      await renderDetailPage();
    } else {
      renderNotFoundPage();
    }
  } catch (error) {
    console.error("Global render error:", error);
    $root.innerHTML = ErrorUI("productList");
    const retryButton = document.querySelector("#retry-btn");
    if (retryButton) {
      retryButton.addEventListener("click", () => render());
    }
  }
};

function main() {
  cartState.subscribe(renderCartModal);

  // popstate 이벤트 등록
  window.addEventListener("popstate", () => render());

  // 이벤트 위임 방식으로 클릭 이벤트 처리
  const $root = document.querySelector("#root");

  $root.addEventListener("click", async (e) => {
    // 장바구니 추가 버튼
    const addCartButton = e.target.closest(".add-to-cart-btn");
    if (addCartButton) {
      e.stopPropagation();
      e.preventDefault();

      const productCard = e.target.closest(".product-card");
      if (productCard) {
        storedData({ id: productCard.dataset.productId });
      }

      showToast("success");
      return;
    }

    // 상품 카드 클릭
    const productCard = e.target.closest(".product-card");
    if (productCard) {
      e.preventDefault();
      const productId = productCard.dataset.productId;
      push(`product/${productId}`);
      return;
    }

    // 카테고리1 필터 버튼
    const category1Button = e.target.closest(".category1-filter-btn");
    if (category1Button) {
      const { searchParams } = getQueryParams();
      searchParams.set("category1", e.target.dataset.category1);
      push(`?${searchParams}`);
      return;
    }

    // 카테고리2 필터 버튼
    const category2Button = e.target.closest(".category2-filter-btn");
    if (category2Button) {
      const { searchParams } = getQueryParams();
      searchParams.set("category2", e.target.dataset.category2);
      push(`?${searchParams}`);
      return;
    }

    const category1Breadcrumb = e.target.closest("#category1-breadcrumb");
    if (category1Breadcrumb) {
      const { searchParams } = getQueryParams();
      searchParams.delete("category2");
      push(`?${searchParams}`);
    }

    const goToProductList = e.target.closest(".go-to-product-list");
    if (goToProductList) {
      e.preventDefault();
      push("/front_7th_chapter2-1/");
      return;
    }

    const detailAddToCartBtn = e.target.closest("#add-to-cart-btn");
    if (detailAddToCartBtn) {
      const quantityInput = document.querySelector("#quantity-input");
      const productId = location.pathname.split("/").pop();
      if (quantityInput) {
        storedData({ id: productId, datailPageQuantity: quantityInput.value });
      }

      showToast("success");
      return;
    }

    const relatedProductCard = e.target.closest(".related-product-card");
    if (relatedProductCard) {
      const productId = relatedProductCard.dataset.productId;
      push(`${productId}`);
      return;
    }

    // 장바구니 아이콘 클릭
    const cartIconBtn = e.target.closest("#cart-icon-btn");
    if (cartIconBtn) {
      if (!getLocalStorage(ADD_CART_LIST).items) setLocalStorage(ADD_CART_LIST, { items: [], selectedAll: false });

      const cartModal = document.querySelector(".cart-modal");
      if (!cartModal) {
        $root.insertAdjacentHTML("beforeend", CartModal());
        document.addEventListener("keydown", (e) => handleCartModalEscape(e));
      }
      return;
    }

    // 장바구니 모달 바깥 영역 클릭
    const cartModalOverlay = e.target.closest(".cart-modal-overlay");
    if (cartModalOverlay) {
      closeCartModal();
      return;
    }

    // 장바구니 close 버튼 클릭
    const carModalCloseBtn = e.target.closest("#cart-modal-close-btn");
    if (carModalCloseBtn) {
      closeCartModal();
      return;
    }

    // 상세 페이지 수량 조절 이벤트
    const decreaseBtn = e.target.closest("#quantity-decrease");
    const increaseBtn = e.target.closest("#quantity-increase");

    if (decreaseBtn) {
      const quantityInput = document.querySelector("#quantity-input");
      if (quantityInput) {
        const currentValue = Number(quantityInput.value);
        if (currentValue > 1) {
          quantityInput.value = currentValue - 1;
          return;
        }
      }
    }

    if (increaseBtn) {
      const quantityInput = document.querySelector("#quantity-input");
      if (quantityInput) {
        const currentValue = Number(quantityInput.value);
        if (currentValue < 107) {
          quantityInput.value = currentValue + 1;
          return;
        }
      }
    }

    // 장바구니 모달 전체 선택 체크
    const selectAllCheckbox = e.target.closest("#cart-modal-select-all-checkbox");
    if (selectAllCheckbox) {
      cartState.toggleSelectAll();
      return;
    }

    // 장바구니 전체 비우기
    const cartClearButton = e.target.closest("#cart-modal-clear-cart-btn");
    if (cartClearButton) {
      cartState.clearCart();
      updateCartCount();
      showToast("delete");
      return;
    }

    // 단일 항목 삭제
    const cartItemRemoveBtn = e.target.closest(".cart-item-remove-btn");
    if (cartItemRemoveBtn) {
      const targetId = cartItemRemoveBtn.dataset.productId;
      cartState.removeItem(targetId);
      updateCartCount();
      showToast("delete");
      return;
    }

    // 장바구니 모달 수량 감소
    const quantityDecreaseBtn = e.target.closest(".quantity-decrease-btn");
    if (quantityDecreaseBtn) {
      const targetId = quantityDecreaseBtn.dataset.productId;
      cartState.decreaseQuantity(targetId); // 상태 변경 → 자동 재렌더링
      return;
    }

    // 장바구니 모달 수량 증가
    const quantityIncreaseBtn = e.target.closest(".quantity-increase-btn");
    if (quantityIncreaseBtn) {
      const targetId = quantityIncreaseBtn.dataset.productId;
      cartState.increaseQuantity(targetId); // 상태 변경 → 자동 재렌더링
      return;
    }

    // 선택한 상품 삭제
    const removeSelectedBtn = e.target.closest("#cart-modal-remove-selected-btn");
    if (removeSelectedBtn) {
      cartState.removeSelectedItems(); // 상태 변경 → 자동 재렌더링
      updateCartCount();
      return;
    }

    // 선택 체크박스
    const cartItemCheckbox = e.target.closest(".cart-item-checkbox");
    if (cartItemCheckbox) {
      const targetId = cartItemCheckbox.dataset.productId;
      cartState.toggleItemSelect(targetId); // 상태 변경 → 자동 재렌더링
      return;
    }
  });

  // 초기 렌더링
  render();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
