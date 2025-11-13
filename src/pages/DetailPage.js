import { DetailLayout } from "./DetailLayout";
import { getProduct, getProducts } from "../api/productApi.js";
import { useState } from "../lib/hook.js";
import { navigate } from "../router/router.js";
import { cartStore } from "../store/cartStore.js";
import { showToast } from "../lib/toast.js";

import { ProductDetailLoading } from "../components/productDetail/ProductDetailLoading.js";
import { ProductBreadcrumb } from "../components/productDetail/ProductBreadcrumb.js";
import { ProductDetailInfo } from "../components/productDetail/ProductDetailInfo.js";
import { RelatedProductsList } from "../components/productDetail/RelatedProductsList.js";
import { ModalShell } from "../components/modal/ModalShell.js";

const runtime = {
  setMainProductState: null, // 상품 상세 상태 설정 핸들러
  mainProductState: null, // 상품 상세 상태

  isFetching: false, // 데이터 로딩 여부
  unMount: null, // 컴포넌트 언마운트 핸들러
  setProductQty: null, // 수량 설정 핸들러
  productQty: 1, // 수량 상태
  setSelectProductList: null, // 장바구니 상태 설정 핸들러
  selectProductList: null, // 장바구니 상태
  cartUnsubscribe: null, // 장바구니 구독 해제 함수
  isCartSubscribed: false, // 장바구니 구독 여부
  cartSyncHandler: null, // 장바구니 동기화 핸들러
  isCartModalOpen: false, // 모달 열림 상태
};

const buildPageView = (state) => {
  const { loading, product, relatedProducts, error, productQty, selectProductList } = state;
  if (error) throw new Error(error);
  const safeProduct = product ?? {};

  return DetailLayout({
    children: loading
      ? ProductDetailLoading()
      : /*html*/ `
      <main class="max-w-md mx-auto px-4 py-4">
        <!-- 브레드크럼 -->
        ${ProductBreadcrumb(safeProduct)}
        <!-- 상품 상세 정보 -->
        <div class="bg-white rounded-lg shadow-sm mb-6">
          <!-- 상품 정보 -->
          ${ProductDetailInfo(safeProduct)}
          <!-- 수량 선택 및 액션 -->
          <div class="border-t border-gray-200 p-4">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-medium text-gray-900">수량</span>
              <div class="flex items-center">
                <button id="quantity-decrease" class="w-8 h-8 flex items-center justify-center border border-gray-300
                   rounded-l-md bg-gray-50 hover:bg-gray-100">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                  </svg>
                </button>
                <input type="number" id="quantity-input" value="${productQty ?? 1}" min="1" max="107" class="w-16 h-8 text-center text-sm border-t border-b border-gray-300
                  focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <button id="quantity-increase" class="w-8 h-8 flex items-center justify-center border border-gray-300
                   rounded-r-md bg-gray-50 hover:bg-gray-100">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </button>
              </div>
            </div>
            <!-- 액션 버튼 -->
            <button id="add-to-cart-btn" data-product-id="${safeProduct.productId ?? ""}" class="w-full bg-blue-600 text-white py-3 px-4 rounded-md
                 hover:bg-blue-700 transition-colors font-medium">
              장바구니 담기
            </button>
          </div>
        </div>
        <!-- 상품 목록으로 이동 -->
        <div class="mb-6">
          <button class="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md
            hover:bg-gray-200 transition-colors go-to-product-list">
            상품 목록으로 돌아가기
          </button>
        </div>
        <!-- 관련 상품 -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-4 border-b border-gray-200">
            <h2 class="text-lg font-bold text-gray-900">관련 상품</h2>
            <p class="text-sm text-gray-600">같은 카테고리의 다른 상품들</p>
          </div>
          <!-- 관련 상품 목록 -->
          ${relatedProducts ? RelatedProductsList(relatedProducts) : ""}
        </div>
      </main>
      ${ModalShell({ productList: selectProductList })}
    `,
  });
};

const mountDetailPage = () => {
  const $root = document.getElementById("root");
  if (!$root) return () => {};

  // 중복 이벤트 핸들러 초기화
  runtime.unMount?.();
  runtime.unMount = null;

  const handleProductCardClick = (event) => {
    // 관련 상품 클릭
    const item = event.target.closest(".related-product-card");
    if (!item) return;
    const productId = item.dataset.productId;
    if (productId) {
      navigate(`/products/${productId}`);
    }
  };

  const handleCategoryClick = (event) => {
    // 상부 카테고리 클릭
    const item = event.target.closest(".breadcrumb-link");
    if (!item) return;
    const currentCategory1 = runtime.mainProductState?.product?.category1 ?? "";
    const category1 = item.dataset.category1 ?? currentCategory1;
    const category2 = item.dataset.category2 ?? "";
    if (category2) {
      navigate(`/?category1=${category1}&category2=${category2}`);
    }
    if (category1) {
      navigate(`/?category1=${category1}`);
    }
  };

  const handleGoToProductListClick = (event) => {
    // 상품 목록으로 돌아가기
    const item = event.target.closest(".go-to-product-list");
    if (!item) return;

    const currentCategory1 = runtime.mainProductState?.product?.category1 ?? "";
    const currentCategory2 = runtime.mainProductState?.product?.category2 ?? "";
    navigate(`/?category1=${currentCategory1}&category2=${currentCategory2}`);
  };

  const handelQuantityClick = (event) => {
    // 수량 '-', '+' 버튼 클릭
    const clickedButton = event.target.closest("#quantity-increase, #quantity-decrease");
    if (!clickedButton) return;

    // 어떤 버튼인지에 따라 증감 값 계산
    const quantityDiff = clickedButton.id === "quantity-increase" ? 1 : -1;
    const currentQty = runtime.productQty ?? 1;
    const nextQty = Math.max(1, currentQty + quantityDiff);
    runtime.productQty = nextQty;
    runtime.setProductQty?.(nextQty);
  };

  const handleAddToCartClick = (event) => {
    const button = event.target.closest("#add-to-cart-btn");
    if (!button) return;
    const product = runtime.mainProductState?.product;
    if (!product) return;
    const quantityInput = document.querySelector("#quantity-input");
    const rawInputValue = Number.parseInt(quantityInput?.value ?? runtime.productQty ?? 1, 10);
    const ensuredMin = Number.isFinite(rawInputValue) && rawInputValue > 0 ? rawInputValue : 1;
    const maxStock = runtime.mainProductState?.product?.stock ?? null;
    const nextQuantity = Number.isFinite(maxStock) && maxStock > 0 ? Math.min(ensuredMin, maxStock) : ensuredMin;

    if (quantityInput) quantityInput.value = String(nextQuantity);
    runtime.productQty = nextQuantity;
    runtime.setProductQty?.(nextQuantity);

    const quantity = nextQuantity;
    runtime.setSelectProductList?.((prev) => {
      const baseList = Array.isArray(prev) ? prev : [];
      const targetIndex = baseList.findIndex((item) => item.productId === product.productId);
      let nextList;
      if (targetIndex >= 0) {
        nextList = baseList.map((item, index) => {
          if (index !== targetIndex) return item;
          const currentQuantity = Number(item.quantity ?? 0);
          return {
            ...item,
            quantity: currentQuantity + quantity,
          };
        });
      } else {
        nextList = [
          ...baseList,
          {
            productId: product.productId,
            title: product.title,
            image: product.image,
            price: Number(product.lprice) || 0,
            quantity,
            checked: false,
          },
        ];
      }
      runtime.selectProductList = nextList;
      return nextList;
    });
    cartStore.addItem(product, quantity);
    runtime.setProductQty?.(1);
    runtime.productQty = 1;
    if (quantityInput) quantityInput.value = "1";
    showToast({ type: "success", message: "장바구니에 추가되었습니다" });
  };

  const handleAddToCartFromList = (event) => {
    const addButton = event.target.closest(".add-to-cart-btn");
    if (!addButton) return;
    event.preventDefault();
    const card = addButton.closest(".product-card");
    if (!card) return;

    const productId = addButton.dataset.productId ?? card.dataset.productId;
    if (!productId) return;

    const titleElement = card.querySelector(".product-info h3");
    const priceElement = card.querySelector(".product-info + p") ?? card.querySelector(".product-info p:last-child");
    const imageElement = card.querySelector("img");

    const title = titleElement?.textContent?.trim() ?? "";
    const priceText = priceElement?.textContent?.replace(/[^0-9]/g, "") ?? "0";
    const image = imageElement?.getAttribute("src") ?? "";

    const price = Number(priceText) || 0;

    runtime.setSelectProductList?.((prev) => {
      const baseList = Array.isArray(prev) ? prev : [];
      const targetIndex = baseList.findIndex((item) => item.productId === productId);
      let nextList;
      if (targetIndex >= 0) {
        nextList = baseList.map((item, index) => {
          if (index !== targetIndex) return item;
          const currentQuantity = Number(item.quantity ?? 0);
          return {
            ...item,
            quantity: currentQuantity + 1,
          };
        });
      } else {
        nextList = [
          ...baseList,
          {
            productId,
            title,
            image,
            price,
            quantity: 1,
            checked: false,
          },
        ];
      }
      runtime.selectProductList = nextList;
      return nextList;
    });

    cartStore.addItem(
      {
        productId,
        title,
        image,
        lprice: price,
      },
      1,
    );
    showToast({ type: "success", message: "장바구니에 추가되었습니다" });
  };

  const handleCartModalCheckboxChange = (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!target.closest(".cart-modal")) return;
    if (!target.matches("input[type='checkbox']")) return;

    if (target.id === "cart-modal-select-all-checkbox") {
      const shouldChecked = Boolean(target.checked);
      runtime.setSelectProductList?.((prev) => {
        const baseList = Array.isArray(prev) ? prev : [];
        let hasChanged = false;
        const updatedList = baseList.map((item) => {
          if (Boolean(item.checked) === shouldChecked) return item;
          hasChanged = true;
          return { ...item, checked: shouldChecked };
        });
        if (hasChanged) {
          runtime.selectProductList = updatedList;
          return updatedList;
        }
        return baseList;
      });
      cartStore.setAllChecked(shouldChecked);
      return;
    }

    const checkbox = target.closest(".cart-item-checkbox");
    if (!checkbox) return;
    const { productId } = checkbox.dataset ?? {};
    if (!productId) return;
    const shouldChecked = Boolean(target.checked);

    let hasChanged = false;
    runtime.setSelectProductList?.((prev) => {
      const baseList = Array.isArray(prev) ? prev : [];
      const updatedList = baseList.map((item) => {
        if (item.productId !== productId) return item;
        if (Boolean(item.checked) === shouldChecked) return item;
        hasChanged = true;
        return { ...item, checked: shouldChecked };
      });
      if (hasChanged) {
        runtime.selectProductList = updatedList;
        return updatedList;
      }
      return baseList;
    });

    if (hasChanged) {
      cartStore.updateItemChecked(productId, shouldChecked);
    }
  };

  const handleRemoveCartItem = (event) => {
    const removeButton = event.target.closest(".cart-item-remove-btn");
    if (!removeButton) return;

    event.preventDefault();
    event.stopPropagation();

    const { productId } = removeButton.dataset ?? {};
    if (!productId) return;

    runtime.setSelectProductList?.((prev) => {
      if (!Array.isArray(prev)) {
        runtime.selectProductList = [];
        return [];
      }
      const nextList = prev.filter((item) => item.productId !== productId);
      runtime.selectProductList = nextList;
      return nextList;
    });
    cartStore.removeItem(productId);
    const message = "선택된 상품들이 삭제되었습니다";
    showToast({ type: "info", message });
  };

  const handleCartItemQuantityClick = (event) => {
    const increaseButton = event.target.closest(".quantity-increase-btn");
    const decreaseButton = event.target.closest(".quantity-decrease-btn");
    const targetButton = increaseButton ?? decreaseButton;
    if (!targetButton) return;

    event.preventDefault();
    event.stopPropagation();

    const { productId } = targetButton.dataset ?? {};
    if (!productId) return;
    const delta = increaseButton ? 1 : -1;

    let nextQuantity = null;
    let hasChanged = false;
    runtime.setSelectProductList?.((prev) => {
      const baseList = Array.isArray(prev) ? prev : [];
      const updatedList = baseList.map((item) => {
        if (item.productId !== productId) return item;
        const currentQuantity = Number(item.quantity ?? 1);
        const computedQuantity = Math.max(1, currentQuantity + delta);
        nextQuantity = computedQuantity;
        if (computedQuantity === currentQuantity) return item;
        hasChanged = true;
        return { ...item, quantity: computedQuantity };
      });
      if (hasChanged) {
        runtime.selectProductList = updatedList;
        return updatedList;
      }
      return baseList;
    });

    if (hasChanged && nextQuantity !== null) {
      cartStore.updateItemQuantity(productId, nextQuantity);
    }
  };

  const handleClearCart = (event) => {
    const clearButton = event.target.closest("#cart-modal-clear-cart-btn");
    if (!clearButton) return;

    event.preventDefault();
    event.stopPropagation();

    const hadItems = (runtime.selectProductList?.length ?? 0) > 0;
    runtime.setSelectProductList?.(() => {
      runtime.selectProductList = [];
      return [];
    });
    cartStore.clear();
    if (hadItems) {
      showToast({ type: "info", message: "장바구니를 비웠습니다." });
    }
  };

  const handleRemoveSelectedCartItems = (event) => {
    const removeSelectedButton = event.target.closest("#cart-modal-remove-selected-btn");
    if (!removeSelectedButton) return;

    event.preventDefault();
    event.stopPropagation();

    const currentCartItems = runtime.selectProductList ?? [];
    const removedItems = currentCartItems.filter((item) => item.checked);
    if (removedItems.length === 0) {
      showToast({ type: "info", message: "선택된 상품이 없습니다." });
      return;
    }

    const remainingItems = currentCartItems.filter((item) => !item.checked);

    runtime.setSelectProductList?.(remainingItems);
    runtime.selectProductList = remainingItems;

    removedItems.forEach((item) => cartStore.removeItem(item.productId));
    cartStore.setAllChecked(false);
    showToast({ type: "info", message: "선택된 상품들이 삭제되었습니다" });
  };

  const handleCheckoutClick = (event) => {
    const checkoutButton = event.target.closest("#cart-modal-checkout-btn");
    if (!checkoutButton) return;

    event.preventDefault();
    event.stopPropagation();

    showToast({ type: "info", message: "구매 기능은 추후 구현 예정입니다." });
  };

  const handleCartModal = (event) => {
    // 장바구니 모달 열기
    if (
      event.target.closest(".cart-item-remove-btn") ||
      event.target.closest("#cart-modal-clear-cart-btn") ||
      event.target.closest("#cart-modal-remove-selected-btn") ||
      event.target.closest(".quantity-increase-btn") ||
      event.target.closest(".quantity-decrease-btn") ||
      event.target.closest(".cart-item-checkbox")
    )
      return;
    const modal = document.querySelector(".cart-modal");
    if (!modal) return;

    const openButton = event.target.closest("#cart-icon-btn");
    const closeButton = event.target.closest("#cart-modal-close-btn");
    const overlayClicked = event.target.closest(".cart-modal-overlay");

    if (openButton) {
      modal.classList.remove("hidden");
      runtime.isCartModalOpen = true;
      return;
    }

    if (closeButton || overlayClicked) {
      modal.classList.add("hidden");
      runtime.isCartModalOpen = false;
    }
  };

  $root.addEventListener("click", handleProductCardClick);
  $root.addEventListener("click", handleCategoryClick);
  $root.addEventListener("click", handleGoToProductListClick);
  $root.addEventListener("click", handelQuantityClick);
  $root.addEventListener("click", handleAddToCartClick);
  $root.addEventListener("click", handleCartModal);
  $root.addEventListener("click", handleAddToCartFromList);
  $root.addEventListener("change", handleCartModalCheckboxChange);
  $root.addEventListener("click", handleRemoveCartItem);
  $root.addEventListener("click", handleCartItemQuantityClick);
  $root.addEventListener("click", handleClearCart);
  $root.addEventListener("click", handleRemoveSelectedCartItems);
  $root.addEventListener("click", handleCheckoutClick);
  if (runtime.isCartModalOpen) {
    const modal = document.querySelector(".cart-modal");
    if (modal) modal.classList.remove("hidden");
  }
  const unMount = () => {
    $root.removeEventListener("click", handleProductCardClick);
    $root.removeEventListener("click", handleCategoryClick);
    $root.removeEventListener("click", handleGoToProductListClick);
    $root.removeEventListener("click", handelQuantityClick);
    $root.removeEventListener("click", handleAddToCartClick);
    $root.removeEventListener("click", handleCartModal);
    $root.removeEventListener("click", handleAddToCartFromList);
    $root.removeEventListener("change", handleCartModalCheckboxChange);
    $root.removeEventListener("click", handleRemoveCartItem);
    $root.removeEventListener("click", handleCartItemQuantityClick);
    $root.removeEventListener("click", handleClearCart);
    $root.removeEventListener("click", handleRemoveSelectedCartItems);
    $root.removeEventListener("click", handleCheckoutClick);
    const modal = document.querySelector(".cart-modal");
    if (modal && !runtime.isCartModalOpen) modal.classList.add("hidden");
    runtime.cartUnsubscribe?.();
    runtime.cartUnsubscribe = null;
    runtime.isCartSubscribed = false;
    if (runtime.unMount === unMount) runtime.unMount = null;
  };

  runtime.unMount = unMount;
  return unMount;
};

export const DetailPageComponent = (context = {}) => {
  const productId = context?.params?.id;
  if (!productId) {
    console.warn("상품 ID가 제공되지 않았습니다.");
    throw new Error("상품 ID가 제공되지 않았습니다.");
  }

  const [mainProductState, setMainProductState] = useState({
    loading: true,
    product: null,
    relatedProducts: null,
    error: null,
  });

  const [productQty, setProductQty] = useState(1);
  const [selectProductList, setSelectProductList] = useState(cartStore.getState());

  runtime.setMainProductState = setMainProductState;
  runtime.mainProductState = mainProductState;
  runtime.setProductQty = setProductQty;
  runtime.productQty = productQty;
  runtime.setSelectProductList = setSelectProductList;
  runtime.selectProductList = selectProductList;

  if (!runtime.isFetching && mainProductState.loading) {
    runtime.isFetching = true;
    fetchProduct(productId).finally(() => {
      runtime.isFetching = false;
    });
  }

  if (!runtime.isCartSubscribed) {
    runtime.cartSyncHandler ??= (nextCartItems) => {
      if (!Array.isArray(nextCartItems)) {
        runtime.setSelectProductList?.([]);
        runtime.selectProductList = [];
        return;
      }

      const prevItems = runtime.selectProductList ?? [];
      const isSameLength = prevItems.length === nextCartItems.length;
      let isShallowEqual = isSameLength;

      if (isSameLength) {
        for (let index = 0; index < nextCartItems.length; index += 1) {
          const currentItem = nextCartItems[index];
          const prevItem = prevItems[index];
          if (
            !prevItem ||
            prevItem.productId !== currentItem.productId ||
            prevItem.quantity !== currentItem.quantity ||
            Boolean(prevItem.checked) !== Boolean(currentItem.checked)
          ) {
            isShallowEqual = false;
            break;
          }
        }
      }

      if (isShallowEqual) return;

      const snapshot = nextCartItems.map((item) => ({
        ...item,
        checked: Boolean(item.checked),
      }));
      runtime.setSelectProductList?.(snapshot);
      runtime.selectProductList = snapshot;
    };
    runtime.cartUnsubscribe = cartStore.subscribe(runtime.cartSyncHandler);
    runtime.isCartSubscribed = true;
  }

  const props = {
    ...mainProductState,
    productQty,
    selectProductList,
  };
  return buildPageView(props);
};

const fetchProduct = async (productId) => {
  runtime.productQty = 1;
  runtime.setProductQty?.(1);
  runtime.setMainProductState?.(() => ({
    loading: true,
    product: null,
    relatedProducts: null,
    error: null,
  }));

  try {
    const product = await getProduct(productId);
    const res_products = await getProducts({ category2: product.category2 });
    const relatedProducts = res_products.products.filter((item) => item.productId !== product.productId);
    runtime.setMainProductState?.(() => ({
      loading: false,
      product,
      relatedProducts,
      error: null,
    }));
  } catch (error) {
    console.error("상품 상세 로딩 실패", error);
    runtime.setMainProductState?.(() => ({
      loading: false,
      product: null,
      relatedProducts: null,
      error: "상품을 불러오지 못했습니다.",
    }));
    showToast({ type: "error", message: "오류가 발생했습니다." });
  }
};

DetailPageComponent.mount = mountDetailPage;
