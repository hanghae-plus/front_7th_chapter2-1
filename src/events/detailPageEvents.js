import { appendCartProduct } from "../store/appStore.js";

// router는 registerDetailPageEvents에서 주입받을 수 있도록 클로저로 관리
let routerInstance = null;

const handleQuantityChange = (event) => {
  const quantityInput = document.querySelector("#quantity-input");
  if (!quantityInput) {
    return;
  }

  const button = event.target.closest("#quantity-increase, #quantity-decrease");
  if (!button) {
    return;
  }

  event.preventDefault();

  const currentValue = Number(quantityInput.value) || 1;
  const min = Number(quantityInput.min) || 1;
  const max = Number(quantityInput.max) || 999;
  let newValue = currentValue;

  if (button.id === "quantity-increase") {
    // 증가 버튼
    newValue = Math.min(currentValue + 1, max);
  } else if (button.id === "quantity-decrease") {
    // 감소 버튼
    newValue = Math.max(currentValue - 1, min);
  }

  quantityInput.value = String(newValue);
};

const handleDetailPageClick = (event) => {
  // 상품목록으로 돌아가기 버튼 클릭 처리
  const goToProductListButton = event.target.closest(".go-to-product-list");
  if (goToProductListButton && routerInstance) {
    event.preventDefault();

    // 브라우저 히스토리를 확인하여 이전 페이지가 Homepage인지 확인
    // SPA에서는 document.referrer가 항상 정확하지 않을 수 있으므로
    // sessionStorage에 이전 URL을 저장하거나 history를 활용

    // 먼저 history에 이전 경로가 있는지 확인 (브라우저 뒤로가기)
    // 하지만 더 나은 방법은 sessionStorage에 이전 필터 상태를 저장하는 것

    // sessionStorage에서 이전 필터 상태 가져오기
    const previousFilters = sessionStorage.getItem("previousHomepageFilters");

    if (previousFilters) {
      try {
        const filters = JSON.parse(previousFilters);
        const params = new URLSearchParams();

        // 필터 상태 복원
        if (filters.category1) params.set("category1", filters.category1);
        if (filters.category2) params.set("category2", filters.category2);
        if (filters.search) params.set("search", filters.search);
        if (filters.limit) params.set("limit", filters.limit);
        if (filters.sort) params.set("sort", filters.sort);

        const url = params.toString() ? `/?${params.toString()}` : "/";
        routerInstance.push(url);
      } catch {
        // 파싱 실패 시 홈으로 이동
        routerInstance.push("/");
      }
    } else {
      // 이전 필터 상태가 없으면 홈으로 이동
      routerInstance.push("/");
    }

    return;
  }

  // 카테고리 브레드크럼 클릭 처리
  const breadcrumbLink = event.target.closest(".breadcrumb-link");
  if (breadcrumbLink && routerInstance) {
    event.preventDefault();

    const category1 = breadcrumbLink.dataset.category1;
    const category2 = breadcrumbLink.dataset.category2;

    const params = new URLSearchParams();

    if (category2) {
      // 2차 카테고리 클릭 시 1차와 2차 모두 선택
      params.set("category1", category1 || "");
      params.set("category2", category2);
    } else if (category1) {
      // 1차 카테고리 클릭 시 1차만 선택
      params.set("category1", category1);
    }

    const url = params.toString() ? `/?${params.toString()}` : "/";
    routerInstance.push(url);
    return;
  }

  // 수량 버튼 클릭 처리
  const quantityButton = event.target.closest("#quantity-increase, #quantity-decrease");
  if (quantityButton) {
    handleQuantityChange(event);
    return;
  }

  // DetailPage 장바구니 담기 버튼
  const addToCartButton = event.target.closest("#add-to-cart-btn");
  if (addToCartButton) {
    const productId = addToCartButton.dataset.productId;
    if (!productId) {
      return;
    }

    // 상품 상세 정보에서 데이터 추출
    const productImage = document.querySelector(".product-detail-image");
    const productTitle = document.querySelector("h1");
    const productPrice = document.querySelector(".text-2xl.font-bold.text-blue-600");
    const quantityInput = document.querySelector("#quantity-input");

    const title = productTitle?.textContent?.trim() ?? "";
    const priceText = productPrice?.textContent ?? "";
    const price = Number(priceText.replace(/[^\d]/g, "")) || 0;
    const image = productImage?.getAttribute("src") ?? "";
    const quantity = Number(quantityInput?.value ?? 1);

    // 수량을 한 번에 반영하여 장바구니에 추가 (localStorage에 자동 저장됨)
    appendCartProduct({
      id: productId,
      title,
      price,
      image,
      quantity,
    });

    // DetailPage에서는 모달을 띄우지 않음
    return;
  }
};

export const registerDetailPageEvents = (router) => {
  routerInstance = router;
  document.body.addEventListener("click", handleDetailPageClick);
};
