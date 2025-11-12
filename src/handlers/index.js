import { getCategories, getProducts } from "../api/productApi";
import { router } from "../App";
import { HomePage } from "../pages/HomePage";

function itemLimitSelectEventListener() {
  const itemLimitSelector = document.querySelector("#limit-select");

  itemLimitSelector.addEventListener("change", async (event) => {
    const selectedLimit = event.target.value;

    const $root = document.querySelector("#root");
    const data = await getProducts({ limit: selectedLimit });
    const categories = await getCategories();

    $root.innerHTML = HomePage({ ...data, categories, loading: false, limit: selectedLimit });
    itemLimitSelectEventListener();
  });
}

function searchEventListener() {
  const searchInput = document.querySelector("#search-input");

  searchInput.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") return;

    const searchValue = event.target.value;
    const $root = document.querySelector("#root");
    const data = await getProducts({ search: searchValue });
    const categories = await getCategories();

    $root.innerHTML = HomePage({ ...data, categories, loading: false, search: searchValue });
    searchEventListener();
  });
}

function clickCategory1EventListener() {
  const categoryButton = document.querySelectorAll(".category1-filter-btn");

  categoryButton.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const category1 = event.target.dataset.category1;
      const $root = document.querySelector("#root");
      const data = await getProducts({ category1 });
      const categories = await getCategories();
      $root.innerHTML = HomePage({ ...data, categories, loading: false });
      clickCategory1EventListener();
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

  const addToCartEventHandler = () => {
    const productId = addToCartButton.dataset.productId;
    console.log(`상품 ${productId}번이 장바구니에 추가되었습니다.`);
    // TODO 여기서 토스트 트리거 해야 함
  };

  addToCartButton.addEventListener("click", addToCartEventHandler);
}

export function attachDetailPageHandlers() {
  onClickIncreaseCounter();
  onClickDecreaseCounter();
  onClickAddToCart();
}
