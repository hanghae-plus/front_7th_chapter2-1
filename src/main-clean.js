import { HomePage } from "./pages/HomePage.js";
import { DetailPage } from "./pages/DetailPage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { getProducts, getProduct, getCategories } from "./api/productApi.js";
import { getCart, addToCart, getCartCount } from "./api/cartApi.js";
import { showToast } from "./utils/toast.js";
import { CartModal } from "./components/CartModal.js";

export const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
      onUnhandledRequest: "bypass",
    }),
  );

// 전역 상태
let currentFilters = {
  search: "",
  category1: "",
  category2: "",
  sort: "price_asc",
  limit: 20,
  page: 1,
};
let allProducts = [];
let categoriesData = {};
let isLoading = false;
let hasMore = true;
let isCartModalOpen = false;

// URL 관리
const updateURL = (filters) => {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category1) params.set("category1", filters.category1);
  if (filters.category2) params.set("category2", filters.category2);
  if (filters.sort !== "price_asc") params.set("sort", filters.sort);
  if (filters.limit !== 20) params.set("limit", filters.limit.toString());

  const queryString = params.toString();
  const newURL = queryString ? `/?${queryString}` : "/";
  if (window.location.pathname + window.location.search !== newURL) {
    history.pushState(null, null, newURL);
  }
};

const parseURLParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    search: params.get("search") || "",
    category1: params.get("category1") || "",
    category2: params.get("category2") || "",
    sort: params.get("sort") || "price_asc",
    limit: parseInt(params.get("limit")) || 20,
    page: 1,
  };
};

// 라우팅
const push = (path) => {
  history.pushState(null, null, path);
  render();
};

// 메인 렌더링 함수
const render = async (isInfiniteScroll = false) => {
  const $root = document.querySelector("#root");

  // 홈 페이지
  if (location.pathname === "/") {
    try {
      if (!isInfiniteScroll) {
        // 초기 로딩 상태 표시
        $root.innerHTML = HomePage({
          loading: true,
          categories: {},
          cartCount: getCartCount(),
          products: [],
          filters: currentFilters,
          totalCount: 0,
        });

        allProducts = [];
        currentFilters.page = 1;
        hasMore = true;
      }

      // 카테고리 데이터 로드
      if (Object.keys(categoriesData).length === 0) {
        try {
          categoriesData = await getCategories();
        } catch (error) {
          console.error("카테고리 로드 실패:", error);
        }
      }

      // 상품 데이터 로드
      if (isLoading || !hasMore) return;
      isLoading = true;

      const data = await getProducts(currentFilters);

      if (isInfiniteScroll) {
        allProducts = [...allProducts, ...data.products];
      } else {
        allProducts = data.products;
      }

      hasMore = data.pagination.hasNext;
      isLoading = false;

      // 화면 렌더링
      $root.innerHTML = HomePage({
        products: allProducts,
        filters: currentFilters,
        categories: categoriesData,
        cartCount: getCartCount(),
        loading: false,
        error: false,
        totalCount: data.pagination?.total || 0,
      });

      // 이벤트 리스너 등록
      setupHomePageEvents();
    } catch (error) {
      console.error("상품 로드 실패:", error);
      isLoading = false;

      $root.innerHTML = HomePage({
        products: [],
        filters: currentFilters,
        categories: categoriesData,
        cartCount: getCartCount(),
        loading: false,
        error: true,
        totalCount: 0,
      });

      // 재시도 버튼 이벤트
      document.getElementById("retry-button")?.addEventListener("click", () => {
        render();
      });
    }
    return;
  }

  // 상품 상세 페이지
  const productMatch = location.pathname.match(/^\/product\/(.+)$/);
  if (productMatch) {
    const productId = productMatch[1];

    try {
      $root.innerHTML = DetailPage({ loading: true });

      const product = await getProduct(productId);
      const relatedProducts = allProducts
        .filter((p) => p.category1 === product.category1 && p.productId !== product.productId)
        .slice(0, 4);

      $root.innerHTML = DetailPage({
        loading: false,
        product,
        relatedProducts,
      });

      setupDetailPageEvents(product);
    } catch (error) {
      console.error("상품 상세 로드 실패:", error);
      push("/404");
    }
    return;
  }

  // 404 페이지
  $root.innerHTML = NotFoundPage();

  document.querySelectorAll("[data-link]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      push(link.getAttribute("href"));
    });
  });
};

// 홈페이지 이벤트 설정
const setupHomePageEvents = () => {
  // 장바구니 아이콘
  document.getElementById("cart-icon-btn")?.addEventListener("click", () => {
    openCartModal();
  });

  // 상품 카드 클릭
  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", () => {
      const productId = card.dataset.productId;
      push(`/product/${productId}`);
    });
  });

  // 장바구니 추가 버튼
  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const productId = btn.dataset.productId;
      const product = allProducts.find((p) => p.productId === productId);

      if (product) {
        addToCart(product);
        showToast("장바구니에 추가되었습니다", "success");
        updateCartBadge();
      }
    });
  });

  // 검색
  const searchInput = document.getElementById("search-input");
  searchInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      currentFilters.search = searchInput.value.trim();
      currentFilters.page = 1;
      allProducts = [];
      updateURL(currentFilters);
      render();
    }
  });

  // 카테고리 필터
  document.querySelectorAll("[data-category1]").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilters.category1 = btn.dataset.category1;
      currentFilters.category2 = "";
      currentFilters.page = 1;
      allProducts = [];
      updateURL(currentFilters);
      render();
    });
  });

  document.querySelectorAll("[data-category2]").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilters.category2 = btn.dataset.category2;
      currentFilters.page = 1;
      allProducts = [];
      updateURL(currentFilters);
      render();
    });
  });

  // Breadcrumb
  document.querySelectorAll("[data-breadcrumb]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.breadcrumb;
      if (action === "reset") {
        currentFilters.category1 = "";
        currentFilters.category2 = "";
        currentFilters.search = "";
        currentFilters.page = 1;
        allProducts = [];
        updateURL(currentFilters);
        render();
      } else if (action === "category1") {
        currentFilters.category2 = "";
        currentFilters.page = 1;
        allProducts = [];
        updateURL(currentFilters);
        render();
      }
    });
  });

  // 정렬/개수 변경
  document.getElementById("sort-select")?.addEventListener("change", (e) => {
    currentFilters.sort = e.target.value;
    currentFilters.page = 1;
    allProducts = [];
    updateURL(currentFilters);
    render();
  });

  document.getElementById("limit-select")?.addEventListener("change", (e) => {
    currentFilters.limit = Number(e.target.value);
    currentFilters.page = 1;
    allProducts = [];
    updateURL(currentFilters);
    render();
  });

  // 무한 스크롤
  window.addEventListener("scroll", handleScroll);
};

const handleScroll = () => {
  if (location.pathname !== "/") return;

  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = document.documentElement.scrollTop;
  const clientHeight = document.documentElement.clientHeight;

  if (scrollHeight - scrollTop - clientHeight < 200 && hasMore && !isLoading) {
    currentFilters.page += 1;
    render(true);
  }
};

// 상세페이지 이벤트 설정
const setupDetailPageEvents = (product) => {
  let quantity = 1;

  const updateQuantity = (newQuantity) => {
    quantity = Math.max(1, Math.min(newQuantity, product.stock || 999));
    const input = document.getElementById("quantity-input");
    if (input) input.value = quantity;
  };

  document.getElementById("quantity-decrease")?.addEventListener("click", () => {
    updateQuantity(quantity - 1);
  });

  document.getElementById("quantity-increase")?.addEventListener("click", () => {
    updateQuantity(quantity + 1);
  });

  document.getElementById("quantity-input")?.addEventListener("change", (e) => {
    updateQuantity(parseInt(e.target.value) || 1);
  });

  document.getElementById("add-to-cart-btn")?.addEventListener("click", () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    showToast(`${quantity}개의 상품이 장바구니에 추가되었습니다`, "success");
    updateCartBadge();
  });

  // Breadcrumb 네비게이션
  document.querySelectorAll(".breadcrumb-link").forEach((link) => {
    link.addEventListener("click", () => {
      const category1 = link.dataset.category1;
      const category2 = link.dataset.category2;

      if (category1) {
        currentFilters.category1 = category1;
        currentFilters.category2 = category2 || "";
        currentFilters.page = 1;
        allProducts = [];
        updateURL(currentFilters);
        push("/");
      }
    });
  });

  // 상품 목록으로 돌아가기
  document.querySelector(".go-to-product-list")?.addEventListener("click", () => {
    push("/");
  });

  // 관련 상품 클릭
  document.querySelectorAll(".related-product-card").forEach((card) => {
    card.addEventListener("click", () => {
      const productId = card.dataset.productId;
      push(`/product/${productId}`);
    });
  });

  // 장바구니 아이콘
  document.getElementById("cart-icon-btn")?.addEventListener("click", () => {
    openCartModal();
  });

  // 홈 링크
  document.querySelectorAll("[data-link]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      push(link.getAttribute("href"));
    });
  });
};

// 장바구니 모달
const openCartModal = () => {
  if (isCartModalOpen) return;
  isCartModalOpen = true;

  const modalContainer = document.createElement("div");
  modalContainer.id = "cart-modal-container";
  modalContainer.innerHTML = CartModal({ cart: getCart() });
  document.body.appendChild(modalContainer);

  setupCartModalEvents();
};

const closeCartModal = () => {
  const modal = document.getElementById("cart-modal-container");
  if (modal) {
    modal.remove();
    isCartModalOpen = false;
  }
};

// const refreshCartModal = () => {
//   const modal = document.getElementById("cart-modal-container");
//   if (modal) {
//     modal.innerHTML = CartModal({ cart: getCart() });
//     setupCartModalEvents();
//   }
// };

const setupCartModalEvents = () => {
  // 닫기
  document.getElementById("cart-modal-close-btn")?.addEventListener("click", closeCartModal);
  document.getElementById("cart-modal-overlay")?.addEventListener("click", closeCartModal);

  // 기타 장바구니 이벤트들은 CartModal 내부에서 처리
};

const updateCartBadge = () => {
  const badge = document.getElementById("cart-badge");
  const count = getCartCount();

  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }
};

// 초기화
window.addEventListener("popstate", () => {
  if (location.pathname === "/") {
    currentFilters = parseURLParams();
    allProducts = [];
  }
  render();
});

const main = () => {
  currentFilters = parseURLParams();
  render();
};

if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
