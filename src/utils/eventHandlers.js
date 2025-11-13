/**
 * 이벤트 핸들러 모듈
 */

import { store } from "../../store.js";
import { getProduct, getProducts } from "../api/productApi.js";
import {
  addToCart,
  updateCartQuantity,
  removeFromCart,
  removeSelectedFromCart,
  toggleCartItemSelection,
  selectAllCartItems,
} from "./cartUtils.js";
import { buildUpdatedUrl } from "./urlUtils.js";

/**
 * 이벤트 핸들러 클래스
 */
export class EventHandlers {
  constructor({ navigate, loadProducts, retryLoadProducts, isFetchingProducts }) {
    this.navigate = navigate;
    this.loadProducts = loadProducts;
    this.retryLoadProducts = retryLoadProducts;
    this.isFetchingProducts = isFetchingProducts;
    this.toastTimeouts = new Map();
  }

  /**
   * 토스트 메시지를 표시하고 자동으로 숨깁니다
   * @param {string} toastState - 토스트 상태
   * @param {number} duration - 표시 시간 (ms, 기본값: 3000)
   */
  showToast(toastState, duration = 3000) {
    // 기존 토스트 타이머 취소
    const existingTimeout = this.toastTimeouts.get("toast");
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    store.setState({ toastState });

    const timeout = setTimeout(() => {
      store.setState({ toastState: "" });
      this.toastTimeouts.delete("toast");
    }, duration);

    this.toastTimeouts.set("toast", timeout);
  }

  /**
   * 상품 목록에서 장바구니에 추가
   */
  handleAddToCartFromList = (e) => {
    const $addToCartBtn = e.target.closest(".add-to-cart-btn");
    if (!$addToCartBtn) return false;

    e.stopPropagation();
    const productId = $addToCartBtn.dataset.productId;
    if (!productId) return false;

    const product = store.state.products?.products?.find((p) => p.productId === productId);
    if (!product) return false;

    const cartList = addToCart(store.state.cartList, product, 1);
    store.setState({ cartList });
    this.showToast("addCart");
    return true;
  };

  /**
   * 상품 카드 클릭 처리
   */
  handleProductCardClick = async (e) => {
    const $productCard = e.target.closest(".product-card") || e.target.closest(".related-product-card");
    if (!$productCard || e.target.closest(".add-to-cart-btn")) return false;

    const productId = $productCard.dataset.productId;
    if (!productId) return false;

    this.navigate(`/product/${productId}`);

    const currentProduct = await getProduct(productId);
    if (!currentProduct) return true;

    let relatedProducts = await getProducts({ category2: currentProduct.category2 });
    relatedProducts = relatedProducts.products.filter((product) => product.productId !== productId);
    store.setState({ currentProduct, relatedProducts });
    return true;
  };

  /**
   * 장바구니 모달 관련 핸들러
   */
  handleCartModal = (e) => {
    const $cartIconBtn = e.target.closest("#cart-icon-btn");
    if ($cartIconBtn) {
      store.setState({ isCartModalOpen: true });
      return true;
    }

    const $cartModalCloseBtn = e.target.closest("#cart-modal-close-btn");
    if ($cartModalCloseBtn) {
      store.setState({ isCartModalOpen: false });
      return true;
    }

    const $cartModalOverlay = e.target.closest("#cart-modal-overlay");
    if ($cartModalOverlay) {
      store.setState({ isCartModalOpen: false });
      return true;
    }

    return false;
  };

  /**
   * 장바구니 아이템 수량 조절
   */
  handleCartQuantity = (e) => {
    const $decreaseBtn = e.target.closest(".quantity-decrease-btn");
    if ($decreaseBtn) {
      const productId = $decreaseBtn.dataset.productId;
      const cartList = updateCartQuantity(store.state.cartList, productId, -1);
      store.setState({ cartList });
      return true;
    }

    const $increaseBtn = e.target.closest(".quantity-increase-btn");
    if ($increaseBtn) {
      const productId = $increaseBtn.dataset.productId;
      const cartList = updateCartQuantity(store.state.cartList, productId, 1);
      store.setState({ cartList });
      return true;
    }

    return false;
  };

  /**
   * 장바구니 아이템 삭제
   */
  handleCartItemRemove = (e) => {
    const $removeBtn = e.target.closest(".cart-item-remove-btn");
    if (!$removeBtn) return false;

    const productId = $removeBtn.dataset.productId;
    const cartList = removeFromCart(store.state.cartList, productId);
    store.setState({ cartList });
    this.showToast("selectDelete");
    return true;
  };

  /**
   * 장바구니 아이템 클릭 (상세 페이지로 이동)
   */
  handleCartItemClick = async (e) => {
    const $cartItemImage = e.target.closest(".cart-item-image");
    const $cartItemTitle = e.target.closest(".cart-item-title");
    if (!$cartItemImage && !$cartItemTitle) return false;

    const productId = ($cartItemImage || $cartItemTitle)?.dataset.productId;
    if (!productId) return false;

    store.setState({ isCartModalOpen: false });
    this.navigate(`/product/${productId}`);

    const currentProduct = await getProduct(productId);
    if (!currentProduct) return true;

    let relatedProducts = await getProducts({ category2: currentProduct.category2 });
    relatedProducts = relatedProducts.products.filter((product) => product.productId !== productId);
    store.setState({ currentProduct, relatedProducts });
    return true;
  };

  /**
   * 장바구니 아이템 선택
   */
  handleCartItemSelection = (e) => {
    const $checkbox = e.target.closest(".cart-item-checkbox");
    if ($checkbox) {
      const productId = $checkbox.dataset.productId;
      const cartList = toggleCartItemSelection(store.state.cartList, productId);
      store.setState({ cartList });
      return true;
    }

    const $selectAllCheckbox = e.target.closest("#cart-modal-select-all-checkbox");
    if ($selectAllCheckbox) {
      const isChecked = $selectAllCheckbox.checked;
      const cartList = selectAllCartItems(store.state.cartList, isChecked);
      store.setState({ cartList });
      return true;
    }

    return false;
  };

  /**
   * 장바구니 선택 삭제
   */
  handleCartRemoveSelected = (e) => {
    const $removeSelectedBtn = e.target.closest("#cart-modal-remove-selected-btn");
    if (!$removeSelectedBtn) return false;

    const cartList = removeSelectedFromCart(store.state.cartList);
    store.setState({ cartList });
    this.showToast("selectDelete");
    return true;
  };

  /**
   * 장바구니 전체 비우기
   */
  handleCartClear = (e) => {
    const $clearCartBtn = e.target.closest("#cart-modal-clear-cart-btn");
    if (!$clearCartBtn) return false;

    store.setState({ cartList: [] });
    this.showToast("allDelete");
    return true;
  };

  /**
   * 상품 상세 페이지 수량 조절
   */
  handleDetailQuantity = (e) => {
    const $quantityDecrease = e.target.closest("#quantity-decrease") || e.target.closest("#quantity-decrease-btn");
    const $quantityIncrease = e.target.closest("#quantity-increase") || e.target.closest("#quantity-increase-btn");
    const $quantityInput = document.getElementById("quantity-input");

    if ($quantityDecrease && $quantityInput && Number($quantityInput.value) > 1) {
      $quantityInput.value = Number($quantityInput.value) - 1;
      return true;
    }

    if ($quantityIncrease && $quantityInput && store.state.currentProduct?.stock) {
      if (Number($quantityInput.value) < store.state.currentProduct.stock) {
        $quantityInput.value = Number($quantityInput.value) + 1;
      }
      return true;
    }

    return false;
  };

  /**
   * 상품 상세 페이지 장바구니 담기
   */
  handleDetailAddToCart = (e) => {
    const $detailAddToCartBtn = e.target.closest("#add-to-cart-btn");
    if (!$detailAddToCartBtn) return false;

    const currentProduct = store.state.currentProduct;
    if (!currentProduct || !currentProduct.productId) return false;

    const $input = document.getElementById("quantity-input");
    const quantity = $input ? Number($input.value) : 1;
    const cartList = addToCart(store.state.cartList, currentProduct, quantity);
    store.setState({ cartList });
    this.showToast("addCart");
    return true;
  };

  /**
   * 토스트 닫기
   */
  handleToastClose = (e) => {
    const $toastCloseBtn = e.target.closest("#toast-close-btn");
    if (!$toastCloseBtn) return false;

    store.setState({ toastState: "" });
    return true;
  };

  /**
   * 에러 재시도
   */
  handleErrorRetry = (e) => {
    const $errorRetryBtn = e.target.closest("#error-retry-btn");
    if (!$errorRetryBtn) return false;

    this.retryLoadProducts();
    return true;
  };

  /**
   * 카테고리 필터 핸들러
   */
  handleCategoryFilter = (e) => {
    // 전체 카테고리
    const $categoryResetBtn = e.target.closest("[data-breadcrumb='reset']");
    if ($categoryResetBtn) {
      e.preventDefault();
      // category1, category2를 명시적으로 제거한 URL 생성
      const url = buildUpdatedUrl({ category1: "", category2: "" });
      this.navigate(url);
      this.updateCategoryState();
      return true;
    }

    // 1차 카테고리
    const $category1Btn = e.target.closest(".category1-filter-btn");
    if ($category1Btn) {
      e.preventDefault();
      e.stopPropagation();
      const category1 = $category1Btn.dataset.category1;
      if (category1 && category1 !== store.state.category1) {
        const url = buildUpdatedUrl({ category1, category2: "" });
        this.navigate(url);
        this.updateCategoryState();
      }
      return true;
    }

    // 2차 카테고리
    const $category2Btn = e.target.closest(".category2-filter-btn");
    if ($category2Btn) {
      e.preventDefault();
      e.stopPropagation();
      const category2 = $category2Btn.dataset.category2;
      const category1 = store.state.category1 || "";
      if (category2 && category2 !== store.state.category2) {
        const url = buildUpdatedUrl({ category1, category2 });
        this.navigate(url);
        this.updateCategoryState();
      }
      return true;
    }

    // 브레드크럼 링크
    const $breadcrumbLink = e.target.closest(".breadcrumb-link");
    if ($breadcrumbLink) {
      e.preventDefault();
      const category1 = $breadcrumbLink.dataset.category1;
      const category2 = $breadcrumbLink.dataset.category2;

      if (category1) {
        // 1차 카테고리 클릭
        const url = buildUpdatedUrl({ category1, category2: "" });
        this.navigate(url);
        this.updateCategoryState();
      } else if (category2) {
        // 2차 카테고리 클릭 - 상품의 category1을 사용
        const currentProduct = store.state.currentProduct;
        const productCategory1 = currentProduct?.category1 || "";
        const url = buildUpdatedUrl({ category1: productCategory1, category2 });
        this.navigate(url);
        this.updateCategoryState();
      }
      return true;
    }

    return false;
  };

  /**
   * 상품 목록으로 돌아가기
   */
  handleGoToProductList = (e) => {
    const $goToProductListBtn = e.target.closest(".go-to-product-list");
    if (!$goToProductListBtn) return false;

    e.preventDefault();
    const currentProduct = store.state.currentProduct;
    const category1 = currentProduct?.category1 || "";
    const category2 = currentProduct?.category2 || "";

    const url = buildUpdatedUrl({ category1, category2 });
    this.navigate(url);
    this.updateCategoryState();
    return true;
  };

  /**
   * 카테고리 상태 업데이트
   * navigate 함수가 이미 URL 파라미터를 파싱해서 store에 반영하므로,
   * 여기서는 로딩 상태만 업데이트합니다.
   */
  updateCategoryState() {
    // navigate가 이미 category1, category2를 store에 반영했으므로
    // 로딩 상태만 업데이트
    store.setState({
      isLoaded: false,
      currentPage: 1,
      hasMore: true,
      error: null,
    });

    if (store.state.path === "/" && !this.isFetchingProducts()) {
      queueMicrotask(() => {
        this.loadProducts(1, false);
      });
    }
  }

  /**
   * 클릭 이벤트 통합 핸들러
   */
  handleClick = async (e) => {
    // 더 구체적인 핸들러부터 처리
    if (this.handleAddToCartFromList(e)) return;
    if (await this.handleProductCardClick(e)) return;
    if (this.handleCartModal(e)) return;
    if (this.handleCartQuantity(e)) return;
    if (this.handleCartItemRemove(e)) return;
    if (await this.handleCartItemClick(e)) return;
    if (this.handleCartItemSelection(e)) return;
    if (this.handleCartRemoveSelected(e)) return;
    if (this.handleCartClear(e)) return;
    if (this.handleDetailQuantity(e)) return;
    if (this.handleDetailAddToCart(e)) return;
    if (this.handleToastClose(e)) return;
    if (this.handleErrorRetry(e)) return;
    if (this.handleCategoryFilter(e)) return;
    if (this.handleGoToProductList(e)) return;

    // data-link 속성이 있는 링크 처리
    const $link = e.target.closest("[data-link]");
    if ($link) {
      e.preventDefault();
      this.navigate($link.getAttribute("href") || "/");
    }
  };

  /**
   * 정리 작업 (라이프사이클 종료 시)
   */
  cleanup() {
    // 모든 타이머 정리
    this.toastTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.toastTimeouts.clear();
  }
}
