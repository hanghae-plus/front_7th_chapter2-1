import { router } from "../App";

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

export function attachHomePageEventListeners() {
  itemLimitSelectEventListener();
  itemSortSelectEventListener();
  searchEventListener();
  clickCategory1EventListener();
  clickCategory2EventListener();
  clickBreadcrumbBtn();
  clickProductItem();
  setUpInfiniteScroll();
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

let infiniteScrollObserver = null;
let isLoadingMore = false;

function setUpInfiniteScroll() {
  // 기존 Observer 제거
  if (infiniteScrollObserver) {
    infiniteScrollObserver.disconnect();
    infiniteScrollObserver = null;
  }

  const sentinel = document.querySelector("#infinite-scroll-sentinel");
  if (!sentinel) {
    return; // 마지막 페이지
  }

  infiniteScrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isLoadingMore) {
          isLoadingMore = true;

          const searchParams = new URLSearchParams(window.location.search);
          const currentPage = parseInt(searchParams.get("current")) || 1;

          searchParams.set("current", String(currentPage + 1));

          // Observer 제거
          infiniteScrollObserver.disconnect();
          infiniteScrollObserver = null;

          // 무한 스크롤 옵션과 함께 navigateTo 호출
          router.navigateTo(`/?${searchParams.toString()}`, { isInfiniteScroll: true });

          // 약간의 딜레이 후 플래그 해제
          setTimeout(() => {
            isLoadingMore = false;
          }, 300);
        }
      });
    },
    {
      rootMargin: "100px", // 40px sentinel이 화면에 보이기 전에 미리 로드
      threshold: 0.1,
    },
  );

  infiniteScrollObserver.observe(sentinel);
}
