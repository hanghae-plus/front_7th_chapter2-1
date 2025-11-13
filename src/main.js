import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { Cart } from "./components/Cart.js";
import { renderCartBadge } from "./components/Header.js";
import { AddToCartToast, showToast } from "./components/Toast.js";
import { DetailPage } from "./pages/DetailPage.js";
import { HomePage } from "./pages/HomePage.js";
import { filters } from "./store/filters.js";
import {
  addCartItemToLocalStorage,
  getCartItemsFromLocalStorage,
  updateCartItemSelectedStatus,
  updateCartSelectAllStatus,
} from "./utils/storage.js";

let categories = [];

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      onUnhandledRequest: "bypass",
    }),
  );

const init = async () => {
  const $root = document.getElementById("root");
  $root.innerHTML = HomePage({ isLoading: true });
  const data = await getProducts();

  // 카테고리 담기
  const newCategories = await getCategories();
  categories = newCategories;

  $root.innerHTML = HomePage({ ...data, categories, isLoading: false });

  filters.subscribe(render);
  eventHandlers();
  renderCartBadge();
  renderCart();
};

// Cart를 렌더링하는 함수
const renderCart = () => {
  const cartContainer = document.querySelector(".cart-modal-container");
  if (!cartContainer) return;

  // 현재 모달이 보이는 상태인지 확인
  const cartModal = cartContainer.querySelector(".cart-modal");
  const isVisible = cartModal && !cartModal.classList.contains("hidden");

  // Cart 다시 렌더링
  cartContainer.innerHTML = Cart();

  // 이전 상태 유지
  if (isVisible) {
    cartContainer.querySelector(".cart-modal").classList.remove("hidden");
  }
};

const render = async () => {
  const basePath = import.meta.env.BASE_URL; // vite 제공
  const pathName = window.location.pathname;
  const relativePath = pathName.replace(basePath, "/").replace(/\/$/, "") || "/";

  const $root = document.getElementById("root");

  if (relativePath === "/") {
    const data = await getProducts(filters.getState());
    $root.innerHTML = HomePage({ ...data, categories, isLoading: false });
  } else {
    const productId = window.location.pathname.split("/").pop();
    $root.innerHTML = DetailPage({ isLoading: true });
    const data = await getProduct(productId);
    $root.innerHTML = DetailPage({ ...data, isLoading: false });
  }

  eventHandlers();
  renderCartBadge();
  renderCart();

  window.addEventListener("popstate", render);
};

const eventHandlers = () => {
  document.addEventListener("click", async (event) => {
    // 상품 카드 클릭 이벤트 핸들러 -> 상세 페이지로 이동
    // if (document.querySelector(".product-card") && !event.target.closest(".add-to-cart-btn")) {
    //   event.stopPropagation();
    //   const productId = event.target.closest(".product-card").dataset.productId;
    //   history.pushState("", "", `/product/${productId}`);
    //   render();
    // }

    // breadcrumb 전체 버튼 클릭 시 필터 초기화
    if (event.target.closest("button[data-breadcrumb='reset']")) {
      filters.setState({ category1: "", category2: "" });
    }

    // breadcrumb 카테고리 1 버튼 클릭 시 필터 적용
    if (event.target.closest("button[data-breadcrumb='category1']")) {
      const category1 = event.target.closest("button[data-breadcrumb='category1']").dataset.category1;
      filters.setState({ category1, category2: "" });
    }

    // 카테고리 1 필터 버튼 클릭 이벤트 핸들러
    if (event.target.closest(".category1-filter-btn")) {
      const category1 = event.target.dataset.category1;

      filters.setState({ category1 });
    }
    // 카테고리 2 버튼 클릭 이벤트 핸들러
    if (event.target.closest(".category2-filter-btn")) {
      const category1 = event.target.closest(".category2-filter-btn").dataset.category1;
      const category2 = event.target.closest(".category2-filter-btn").dataset.category2;

      filters.setState({ category1, category2 });
    }

    // 장바구니 버튼 클릭 이벤트 핸들러
    if (event.target.closest("#cart-icon-btn")) {
      const cartModal = document.querySelector(".cart-modal");
      if (!cartModal) {
        console.error("❌ .cart-modal을 찾을 수 없습니다!");
        return;
      }
      cartModal.classList.remove("hidden");
    }

    // 장바구니 모달 닫기 버튼 클릭 이벤트 핸들러
    if (event.target.closest("#cart-modal-close-btn")) {
      const cartModal = document.querySelector(".cart-modal");
      cartModal.classList.add("hidden");
    }

    // 장바구니 모달 배경 클릭 시 닫기
    if (event.target.closest(".cart-modal-overlay")) {
      const cartModal = document.querySelector(".cart-modal");
      cartModal.classList.add("hidden");
    }

    // 아이템 중 장바구니 담기 눌렀을 때 로컬 스토리지에 추가
    if (event.target.closest(".add-to-cart-btn")) {
      event.preventDefault();
      event.stopPropagation();
      const productId = event.target.closest(".add-to-cart-btn").dataset.productId;
      const product = await getProduct(productId);
      addCartItemToLocalStorage(productId, product);
      renderCart();
      renderCartBadge();
      showToast(AddToCartToast());
    }

    // 장바구니 전체선택 체크박스 클릭
    if (event.target.id === "cart-modal-select-all-checkbox") {
      event.preventDefault();
      event.stopPropagation();

      const selectAll = event.target.checked;
      updateCartSelectAllStatus(selectAll);
      renderCart();
    }

    // 장바구니 체크박스 클릭
    if (event.target.classList.contains("cart-item-checkbox")) {
      event.preventDefault();
      event.stopPropagation();

      const cartItems = getCartItemsFromLocalStorage();
      const cartItem = cartItems.find((item) => item.id === event.target.dataset.productId);
      cartItem.selected = !cartItem.selected;
      updateCartItemSelectedStatus(cartItem.id, cartItem.selected);
      renderCart();
    }
  });

  // input 검색 이벤트 핸들러
  document.addEventListener("keyup", (event) => {
    const target = document.getElementById("search-input");
    if (target && event.key === "Enter") {
      const search = target.value;

      if (search.length > 0) {
        filters.setState({ search });
      } else {
        filters.setState({ search: "" });
      }
    }
  });

  document.addEventListener("change", () => {
    // 개수 선택 이벤트 핸들러
    const limitSelect = document.getElementById("limit-select");
    if (limitSelect) {
      const limit = limitSelect.value;
      filters.setState({ limit });
    }
    // 정렬 선택 이벤트 핸들러
    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
      const sort = sortSelect.value;
      filters.setState({ sort });
    }
  });
};

async function main() {
  init();
}

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
