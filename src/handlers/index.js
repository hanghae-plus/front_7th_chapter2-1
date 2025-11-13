import { cartState, router } from "../App";
import { setUpInfiniteScroll } from "./infiniteScroll";
import { showToast } from "./toast";
import { attachCartIconClickEvent, setupCartIconSubscription } from "./cart";

function itemLimitSelectEventListener() {
  const itemLimitSelector = document.querySelector("#limit-select");
  if (!itemLimitSelector) return;

  itemLimitSelector.addEventListener("change", (event) => {
    const selectedLimit = event.target.value;

    // 현재 URL의 searchParams 가져오기
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("limit", selectedLimit);
    searchParams.set("current", "1"); // 필터 변경 시 첫 페이지로

    // Router의 navigateTo 호출 (pathname + search)
    router.navigateTo(`/?${searchParams.toString()}`);
  });
}

function itemSortSelectEventListener() {
  const itemSortSelector = document.querySelector("#sort-select");
  if (!itemSortSelector || itemSortSelector.dataset.listenerAttached) return;

  itemSortSelector.dataset.listenerAttached = "true";
  itemSortSelector.addEventListener("change", (event) => {
    const selectedSort = event.target.value;

    // 현재 URL의 searchParams 가져오기
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("sort", selectedSort);
    searchParams.set("current", "1"); // 필터 변경 시 첫 페이지로

    // Router의 navigateTo 호출
    router.navigateTo(`/?${searchParams.toString()}`);
  });
}

function searchEventListener() {
  const searchInput = document.querySelector("#search-input");
  if (!searchInput) return;

  searchInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;

    const searchValue = event.target.value;

    // 현재 URL의 searchParams 가져오기
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("search", searchValue);
    searchParams.set("current", "1");

    // Router의 navigateTo 호출
    router.navigateTo(`/?${searchParams.toString()}`);
  });
}

function clickCategory1EventListener() {
  const categoryButtons = document.querySelectorAll(".category1-filter-btn");

  categoryButtons.forEach((button) => {
    if (button.dataset.listenerAttached) return;
    button.dataset.listenerAttached = "true";

    button.addEventListener("click", (event) => {
      const category1 = event.target.dataset.category1;

      // 현재 URL의 searchParams 가져오기
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("category1", category1);
      searchParams.delete("category2"); // category1 변경 시 category2 초기화
      searchParams.set("current", "1");

      // Router의 navigateTo 호출
      router.navigateTo(`/?${searchParams.toString()}`);
    });
  });
}

function clickCategory2EventListener() {
  const categoryButtons = document.querySelectorAll(".category2-filter-btn");

  categoryButtons.forEach((button) => {
    if (button.dataset.listenerAttached) return;
    button.dataset.listenerAttached = "true";

    button.addEventListener("click", (event) => {
      const category2 = event.target.dataset.category2;

      // 현재 URL의 searchParams 가져오기
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("category2", category2);
      searchParams.set("current", "1");

      // Router의 navigateTo 호출
      router.navigateTo(`/?${searchParams.toString()}`);
    });
  });
}

function clickBreadcrumbBtn() {
  const breadcrumbBtns = document.querySelectorAll("[data-breadcrumb]");

  breadcrumbBtns.forEach((btn) => {
    if (btn.dataset.listenerAttached) return;
    btn.dataset.listenerAttached = "true";

    btn.addEventListener("click", () => {
      const action = btn.dataset.breadcrumb;
      const searchParams = new URLSearchParams(window.location.search);

      if (action === "reset") {
        // 전체 - 모든 카테고리 초기화
        searchParams.delete("category1");
        searchParams.delete("category2");
      } else if (action === "category1") {
        // Category1 클릭 - category2만 초기화
        searchParams.delete("category2");
      }
      // category2는 현재 선택된 상태이므로 클릭 불가 (cursor-default)

      searchParams.set("current", "1");
      router.navigateTo(`/?${searchParams.toString()}`);
    });
  });
}

function clickProductItem() {
  const productItems = document.querySelectorAll(".product-image, .product-info");

  productItems.forEach((item) => {
    item.addEventListener("click", (event) => {
      const productId = event.currentTarget.closest(".product-card").dataset.productId;
      router.navigateTo(`/product/${productId}`);
    });
  });
}

function clickAddToCart() {
  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");

  addToCartButtons.forEach((button) => {
    if (button.dataset.listenerAttached) return;
    button.dataset.listenerAttached = "true";

    button.addEventListener("click", (event) => {
      event.stopPropagation(); // 상품 클릭 이벤트 전파 방지
      const productId = event.currentTarget.dataset.productId;
      console.log(`상품 ${productId}번이 장바구니에 추가되었습니다.`);

      // TODO 장바구니 스토어에 추가
      cartState.setState({
        items: [...cartState.getState().items, { productId, quantity: 1 }],
      });

      // Toast 표시
      showToast();
    });
  });
}

export function attachHomePageEventListeners() {
  itemLimitSelectEventListener();
  itemSortSelectEventListener();
  searchEventListener();
  clickCategory1EventListener();
  clickCategory2EventListener();
  clickBreadcrumbBtn();
  clickProductItem();
  attachCartIconClickEvent();
  setupCartIconSubscription();
  setUpInfiniteScroll();
  clickAddToCart();
}

function onClickIncreaseCounter() {
  const increaseButton = document.querySelector("#quantity-increase");

  const increaseEventHandler = () => {
    const quantityInput = document.querySelector("#quantity-input");
    const currentValue = Number(quantityInput.value);
    quantityInput.value = currentValue + 1;
  };
  increaseButton.addEventListener("click", increaseEventHandler);
}

function onClickDecreaseCounter() {
  const decreaseButton = document.querySelector("#quantity-decrease");

  const decreaseEventHandler = () => {
    const quantityInput = document.querySelector("#quantity-input");
    const currentValue = Number(quantityInput.value);

    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
    }
  };

  decreaseButton.addEventListener("click", decreaseEventHandler);
}

function onClickAddToCart() {
  const addToCartButton = document.querySelector("#add-to-cart-btn");

  if (!addToCartButton) return;

  const addToCartEventHandler = () => {
    const productId = addToCartButton.dataset.productId;
    console.log(`상품 ${productId}번이 장바구니에 추가되었습니다.`);

    // Toast 표시
    showToast();
  };

  addToCartButton.addEventListener("click", addToCartEventHandler);
}

export function attachDetailPageHandlers() {
  onClickIncreaseCounter();
  onClickDecreaseCounter();
  onClickAddToCart();
  attachCartIconClickEvent();
  setupCartIconSubscription();
}
