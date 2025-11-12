import { router } from "../App";

function itemLimitSelectEventListener() {
  const itemLimitSelector = document.querySelector("#limit-select");
  if (!itemLimitSelector) return;

  itemLimitSelector.addEventListener("change", (event) => {
    const selectedLimit = event.target.value;

    // 현재 URL의 searchParams 가져오기
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("limit", selectedLimit);
    searchParams.set("page", "1"); // 필터 변경 시 첫 페이지로

    // Router의 navigateTo 호출 (pathname + search)
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
    searchParams.set("page", "1");

    // Router의 navigateTo 호출
    router.navigateTo(`/?${searchParams.toString()}`);
  });
}

function clickCategory1EventListener() {
  const categoryButtons = document.querySelectorAll(".category1-filter-btn");

  categoryButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const category1 = event.target.dataset.category1;

      // 현재 URL의 searchParams 가져오기
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("category1", category1);
      searchParams.set("page", "1");

      // Router의 navigateTo 호출
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

export function attachHomePageEventListeners() {
  itemLimitSelectEventListener();
  searchEventListener();
  clickCategory1EventListener();
  clickProductItem();
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

/**
 * Toast 메시지 표시
 */
function showToast() {}

export function attachDetailPageHandlers() {
  onClickIncreaseCounter();
  onClickDecreaseCounter();
  onClickAddToCart();
}
