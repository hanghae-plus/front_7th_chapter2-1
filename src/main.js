import { getCategories, getProduct, getProducts } from "./api/productApi.js";
import { ProductList } from "./components/product/ProductList.js";
import { destroyCartList } from "./components/cart/CartList.js";
import { showToast } from "./components/toast/Toast.js";
import { closeCartModal, openCartModal } from "./pages/CartModal.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { cartStore } from "./store/cartStore.js";
import { updateCategoryUI } from "./utils/categoryUI.js";
import { findRoute, initRouter, push } from "./utils/router.js";

const enableMocking = () =>
  import("./mocks/browser.js").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
    }),
  );
const productCache = new Map();

const render = async () => {
  destroyCartList();
  const $root = document.querySelector("#root");

  const { route, params } = findRoute(location.pathname);
  console.log("main.js", location.pathname, route, params);

  if (!route) {
    $root.innerHTML = NotFoundPage();
    return;
  }

  if (route.path === "/") {
    $root.innerHTML = route.component({ loading: true });
    const query = new URLSearchParams(location.search);
    selectedCat1 = query.get("category1") || null;
    selectedCat2 = query.get("category2") || null;
    const search = query.get("search") || "";
    const limit = Number(query.get("limit")) || 500;
    const sort = query.get("sort") || "price_asc";
    //TODO : Q. 병렬 구성은 어려울까?? (렌더링을 html태그 단위로 하게 될것같아서, 내부에서 처리해야하나???)
    const [categories, products] = await Promise.all([
      getCategories(),
      getProducts({ search: search, category1: selectedCat1, category2: selectedCat2, limit, sort }),
    ]);

    products.products.forEach((product) => {
      productCache.set(product.productId, product);
    });
    $root.innerHTML = route.component({
      categories,
      products,
      loading: false,
    });
  } else if (route.path === "/products/:id") {
    $root.innerHTML = route.component({ loading: true });
    const productId = params[0];
    const data = await getProduct(productId);
    if (!data || data.error) {
      $root.innerHTML = NotFoundPage();
      return;
    }
    const related = await getProducts({ category2: data.category2, limit: 5 });
    related.products = related.products.filter((p) => p.productId !== data.productId);
    $root.innerHTML = route.component({ product: data, relatedProducts: related.products });
  }
};
const refreshProducts = async () => {
  const query = new URLSearchParams(location.search);
  const search = query.get("search") || "";
  const limit = Number(query.get("limit")) || 500;
  const sort = query.get("sort") || "price_asc";
  const [products] = await Promise.all([
    getProducts({ search, category1: selectedCat1, category2: selectedCat2, limit, sort }),
  ]);
  const $productListContainer = document.querySelector("#product-container");

  if ($productListContainer) {
    $productListContainer.outerHTML = ProductList({
      loading: false,
      products: products.products,
    });
  }
  query.set("search", "");
};

const pushWithNoRender = ({ path, selectedCat1 = null, selectedCat2 = null }) => {
  const isHome = location.pathname === "/";
  push(path, { silent: isHome });
  if (isHome) {
    refreshProducts();
    updateCategoryUI(selectedCat1, selectedCat2);
  }
};
/* 이벤트 등록 영역 */
// 카테고리 상태 관리
let selectedCat1 = null;
let selectedCat2 = null;
// 통합 클릭 이벤트 핸들러
document.body.addEventListener("click", (e) => {
  const target = e.target;

  //장바구니 이동
  const openCartModalBtn = target.closest("#cart-icon-btn");
  if (openCartModalBtn) {
    e.preventDefault();
    openCartModal();
    return;
  }
  const closeCartModalBtn = target.closest("#cart-modal-close-btn");
  const closeCartOverlay = target.closest(".cart-modal-overlay");
  const closeCart = closeCartModalBtn || closeCartOverlay;
  if (closeCart) {
    e.preventDefault();
    closeCartModal();
    return;
  }

  // 장바구니 추가 버튼 클릭
  const addToCartBtnMain = target.closest(".add-to-cart-btn");
  const addToCartBtnDetail = target.closest("#add-to-cart-btn");
  const addToCartBtn = addToCartBtnDetail || addToCartBtnMain;

  if (addToCartBtn) {
    e.stopPropagation();
    const product = productCache.get(addToCartBtn.dataset.productId);

    const quantityInput = document.getElementById("quantity-input");
    const quantity = quantityInput ? Math.max(1, Number(quantityInput.value) || 1) : 1;

    cartStore.addToCart({ ...product, quantity });
    showToast("addCart");
    return;
  }

  // 장바구니 갯수 변경
  const cartIncreaseBtn = target.closest(".quantity-increase-btn");
  const cartDecreaseBtn = target.closest(".quantity-decrease-btn");
  if (cartIncreaseBtn) {
    const productId = cartIncreaseBtn.dataset.productId;
    cartStore.addToCart({ productId: productId });
  }
  if (cartDecreaseBtn) {
    const productId = cartDecreaseBtn.dataset.productId;
    cartStore.decreaseQuantity(productId);
  }

  const cartQuantityIncreaseBtn = target.closest("#quantity-increase");
  const cartQuantityDecreaseBtn = target.closest("#quantity-decrease");
  if (cartQuantityIncreaseBtn) {
    const quantityInput = document.getElementById("quantity-input");
    quantityInput.value = Number(quantityInput.value) + 1;
  }
  if (cartQuantityDecreaseBtn) {
    const quantityInput = document.getElementById("quantity-input");
    quantityInput.value = Math.max(1, Number(quantityInput.value) - 1);
  }

  // 장바구니 삭제(선택, 전체)
  const cartRemoveBtn = target.closest("#cart-modal-remove-selected-btn");
  if (cartRemoveBtn) {
    const checkedBoxes = document.querySelectorAll("#cart-list-container .cart-item-checkbox:checked");
    const selectedProductIds = Array.from(checkedBoxes).map((checkbox) => checkbox.dataset.productId);
    // 이제 selectedProductIds를 cartStore에서 삭제 처리
    cartStore.removeProducts(selectedProductIds);
  }

  const cartClear = target.closest("#cart-modal-clear-cart-btn");
  if (cartClear) {
    cartStore.clearCart();
  }

  //상품 카드 클릭
  const productCard = target.closest(".product-card");
  const relatedProductCard = target.closest(".related-product-card");
  const productCardToOpen = relatedProductCard || productCard;
  if (productCardToOpen) {
    console.log("open product id:", productCardToOpen.dataset.productId);
    push(`/products/${productCardToOpen.dataset.productId}`);
    return;
  }

  // 카테고리 필터 클릭
  const resetBtn = target.closest('[data-breadcrumb="reset"]');
  const cat1Btn = target.closest(".category1-filter-btn, [data-breadcrumb='category1']");
  const cat2Btn = target.closest(".category2-filter-btn, [data-breadcrumb='category2']");

  if (resetBtn) {
    selectedCat1 = null;
    selectedCat2 = null;

    const query = new URLSearchParams(location.search);
    query.delete("category1");
    query.delete("category2");

    pushWithNoRender({ path: query.toString() ? `/?${query}` : "/" });
  } else if (cat1Btn) {
    selectedCat1 = cat1Btn.dataset.category1;
    selectedCat2 = null;

    const query = new URLSearchParams(location.search);
    query.set("category1", selectedCat1);
    query.delete("category2");

    pushWithNoRender({ path: `/?${query}`, selectedCat1, selectedCat2 });
  } else if (cat2Btn) {
    selectedCat1 = cat2Btn.dataset.category1;
    selectedCat2 = cat2Btn.dataset.category2;

    const query = new URLSearchParams(location.search);
    query.set("category1", selectedCat1);
    query.set("category2", selectedCat2);

    pushWithNoRender({ path: `/?${query}`, selectedCat1, selectedCat2 });
  }
});

document.addEventListener("change", (e) => {
  const target = e.target;

  const selectedLimit = target.closest("#limit-select")?.value;
  const selectedSort = target.closest("#sort-select")?.value;
  const query = new URLSearchParams(location.search);
  if (selectedLimit) query.set("limit", selectedLimit);
  if (selectedSort) query.set("sort", selectedSort);
  pushWithNoRender({ path: `/?${query}`, selectedCat1: null, selectedCat2: null });
  // history.pushState(null, null, `/?${query}`);
  // refreshProducts();

  // 장바구니 전체 체크박스
  const cartSelectAllCheckbox = target.closest("#cart-modal-select-all-checkbox");
  if (cartSelectAllCheckbox) {
    const isChecked = cartSelectAllCheckbox.checked;
    const itemCheckboxes = document.querySelectorAll("#cart-list-container .cart-item-checkbox");
    itemCheckboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
  }
  // 장바구니 개별 상품 체크박스 클릭
  const eachCartItemCheckbox = target.closest(".cart-item-checkbox");
  if (eachCartItemCheckbox) {
    const itemCheckboxes = document.querySelectorAll("#cart-list-container .cart-item-checkbox");
    const allChecked = Array.from(itemCheckboxes).every((cb) => cb.checked);
    const selectAll = document.getElementById("cart-modal-select-all-checkbox");
    if (selectAll) selectAll.checked = allChecked;

    if (itemCheckboxes.length > 0) {
      const selectedRemoveBtn = document.getElementById("cart-modal-remove-selected-btn");
      selectedRemoveBtn.style.display = "block";
      selectedRemoveBtn.textContent = `선택한 상품 삭제 (${itemCheckboxes.length}개)`;
    } else {
      const selectedRemoveBtn = document.getElementById("cart-modal-remove-selected-btn");
      if (selectedRemoveBtn) selectedRemoveBtn.style.display = "none";
    }
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.closest("#search-input")) {
    e.preventDefault();
    const keyword = e.target.value.trim();
    const query = new URLSearchParams(location.search);
    if (keyword) {
      query.set("search", keyword);
      // pushWithNoRender({ path: `/?${query}`, selectedCat1: null, selectedCat2: null });
      push(`/?${query}`);
      // history.pushState(null, null, `/?${query}`);
    } else {
      query.delete("search");
      pushWithNoRender({ path: `/`, selectedCat1: null, selectedCat2: null });
      // history.pushState(null, null, `/`);
    }

    // refreshProducts();
  }
  const isCartModalOpen = () => {
    return document.getElementById("cart-modal-root")?.hasChildNodes() !== null;
  };
  if (e.key === "Escape" && isCartModalOpen()) {
    e.preventDefault();
    closeCartModal();
    return;
  }
});

initRouter(render);

const main = async () => {
  render();
};

// 애플리케이션 시작
if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
