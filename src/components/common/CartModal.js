import { createStore } from "@/core/Store";
import { Router } from "@/core/Router";
import Toast from "@/components/common/Toast";

// localStorage 키
const CART_STORAGE_KEY = "shopping_cart";

// localStorage에서 장바구니 아이템 불러오기
const loadCartFromStorage = () => {
  try {
    const savedItems = localStorage.getItem(CART_STORAGE_KEY);
    return savedItems ? JSON.parse(savedItems) : [];
  } catch (error) {
    console.error("장바구니 데이터 로드 실패:", error);
    return [];
  }
};

// localStorage에 장바구니 아이템 저장하기
const saveCartToStorage = (items) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("장바구니 데이터 저장 실패:", error);
  }
};

// 장바구니 상태 관리 스토어
export const cartStore = createStore({
  items: loadCartFromStorage(), // localStorage에서 초기 데이터 로드
  isOpen: false,
  selectedIds: new Set(),
});

// 장바구니 아이템이 변경될 때마다 localStorage에 저장
cartStore.subscribe((state) => {
  saveCartToStorage(state.items);
});

// 모달 템플릿들
const EmptyCartTemplate = () => /* HTML */ `
  <div class="flex-1 flex items-center justify-center p-8">
    <div class="text-center">
      <div class="text-gray-400 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"
          />
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">장바구니가 비어있습니다</h3>
      <p class="text-gray-600">원하는 상품을 담아보세요!</p>
    </div>
  </div>
`;

const CartItemTemplate = ({ product, isSelected }) => {
  const totalPrice = product.price * product.quantity;

  return /* HTML */ `
    <div class="flex items-center py-3 border-b border-gray-100 cart-item" data-product-id="${product.productId}">
      <!-- 선택 체크박스 -->
      <label class="flex items-center mr-3">
        <input
          type="checkbox"
          ${isSelected ? "checked" : ""}
          class="cart-item-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          data-product-id="${product.productId}"
        />
      </label>

      <!-- 상품 이미지 -->
      <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
        <img
          src="${product.image}"
          alt="${product.title}"
          class="w-full h-full object-cover cursor-pointer cart-item-image"
          data-product-id="${product.productId}"
        />
      </div>

      <!-- 상품 정보 -->
      <div class="flex-1 min-w-0">
        <h4
          class="text-sm font-medium text-gray-900 truncate cursor-pointer cart-item-title"
          data-product-id="${product.productId}"
        >
          ${product.title}
        </h4>
        <p class="text-sm text-gray-600 mt-1">${Number(product.price).toLocaleString()}원</p>

        <!-- 수량 조절 -->
        <div class="flex items-center mt-2">
          <button
            class="quantity-decrease-btn w-7 h-7 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100"
            data-product-id="${product.productId}"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>
          <input
            type="number"
            value="${product.quantity}"
            min="1"
            class="quantity-input w-12 h-7 text-center text-sm border-t border-b border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            disabled
            data-product-id="${product.productId}"
          />
          <button
            class="quantity-increase-btn w-7 h-7 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
            data-product-id="${product.productId}"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 가격 및 삭제 -->
      <div class="text-right ml-3">
        <p class="text-sm font-medium text-gray-900">${totalPrice.toLocaleString()}원</p>
        <button
          class="cart-item-remove-btn mt-1 text-xs text-red-600 hover:text-red-800"
          data-product-id="${product.productId}"
        >
          삭제
        </button>
      </div>
    </div>
  `;
};

const CartModalTemplate = ({ items, selectedIds }) => {
  const isEmpty = items.length === 0;
  const selectedCount = selectedIds.size;
  const allSelected = items.length > 0 && selectedCount === items.length;

  // 선택된 상품들의 총 가격
  const selectedTotal = items
    .filter((item) => selectedIds.has(item.productId))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 전체 총 가격
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return /* HTML */ `
    <div class="fixed inset-0 z-50 overflow-y-auto cart-modal">
      <!-- 배경 오버레이 -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity cart-modal-overlay"></div>

      <!-- 모달 컨테이너 -->
      <div class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
        <div
          class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden"
        >
          <!-- 헤더 -->
          <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-900 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"
                />
              </svg>
              장바구니
              ${items.length > 0 ? `<span class="text-sm font-normal text-gray-600 ml-1">(${items.length})</span>` : ""}
            </h2>
            <button id="cart-modal-close-btn" class="text-gray-400 hover:text-gray-600 p-1">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 컨텐츠 -->
          <div class="flex flex-col max-h-[calc(90vh-120px)]">
            ${isEmpty
              ? EmptyCartTemplate()
              : /* HTML */ `
                  <!-- 전체 선택 섹션 -->
                  <div class="p-4 border-b border-gray-200 bg-gray-50">
                    <label class="flex items-center text-sm text-gray-700">
                      <input
                        type="checkbox"
                        id="cart-modal-select-all-checkbox"
                        ${allSelected ? "checked" : ""}
                        class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                      />
                      전체선택 (${items.length}개)
                    </label>
                  </div>

                  <!-- 아이템 목록 -->
                  <div class="flex-1 overflow-y-auto">
                    <div class="p-4 space-y-4">
                      ${items
                        .map((item) => CartItemTemplate({ product: item, isSelected: selectedIds.has(item.productId) }))
                        .join("")}
                    </div>
                  </div>
                `}
          </div>

          ${!isEmpty
            ? /* HTML */ `
                <!-- 하단 액션 -->
                <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                  ${selectedCount > 0
                    ? /* HTML */ `
                        <div class="flex justify-between items-center mb-3 text-sm">
                          <span class="text-gray-600">선택한 상품 (${selectedCount}개)</span>
                          <span class="font-medium">${selectedTotal.toLocaleString()}원</span>
                        </div>
                      `
                    : ""}

                  <!-- 총 금액 -->
                  <div class="flex justify-between items-center mb-4">
                    <span class="text-lg font-bold text-gray-900">총 금액</span>
                    <span class="text-xl font-bold text-blue-600">${Number(total).toLocaleString()}원</span>
                  </div>

                  <!-- 액션 버튼들 -->
                  <div class="space-y-2">
                    ${selectedCount > 0
                      ? /* HTML */ `
                          <button
                            id="cart-modal-remove-selected-btn"
                            class="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors text-sm"
                          >
                            선택한 상품 삭제 (${selectedCount}개)
                          </button>
                        `
                      : ""}
                    <div class="flex gap-2">
                      <button
                        id="cart-modal-clear-cart-btn"
                        class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors text-sm"
                      >
                        전체 비우기
                      </button>
                      <button
                        id="cart-modal-checkout-btn"
                        class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        구매하기
                      </button>
                    </div>
                  </div>
                </div>
              `
            : ""}
        </div>
      </div>
    </div>
  `;
};

// 장바구니 모달 관리
const createCartModal = () => {
  const CART_MODAL_ROOT_ID = "cart-modal-root";
  let eventListenersAttached = false;
  let escKeyHandler = null;

  // 모달 Root 초기화
  const initModalRoot = () => {
    let modalRoot = document.getElementById(CART_MODAL_ROOT_ID);
    if (!modalRoot) {
      modalRoot = document.createElement("div");
      modalRoot.id = CART_MODAL_ROOT_ID;
      document.body.appendChild(modalRoot);
    }
    return modalRoot;
  };

  // 이벤트 리스너 등록 (한 번만)
  const attachEventListeners = () => {
    if (eventListenersAttached) return;

    const modalRoot = document.getElementById(CART_MODAL_ROOT_ID);
    if (!modalRoot) return;

    eventListenersAttached = true;

    // 닫기 버튼
    modalRoot.addEventListener("click", (e) => {
      if (e.target.closest("#cart-modal-close-btn") || e.target.closest(".cart-modal-overlay")) {
        hide();
      }
    });

    // 전체 선택
    modalRoot.addEventListener("change", (e) => {
      if (e.target.id === "cart-modal-select-all-checkbox") {
        toggleSelectAll(e.target.checked);
      }
    });

    // 개별 체크박스
    modalRoot.addEventListener("change", (e) => {
      if (e.target.classList.contains("cart-item-checkbox")) {
        toggleSelectItem(e.target.dataset.productId, e.target.checked);
      }
    });

    // 수량 증가/감소
    modalRoot.addEventListener("click", (e) => {
      const decreaseBtn = e.target.closest(".quantity-decrease-btn");
      const increaseBtn = e.target.closest(".quantity-increase-btn");

      if (decreaseBtn) {
        updateQuantity(decreaseBtn.dataset.productId, -1);
      } else if (increaseBtn) {
        updateQuantity(increaseBtn.dataset.productId, 1);
      }
    });

    // 상품 삭제
    modalRoot.addEventListener("click", (e) => {
      if (e.target.closest(".cart-item-remove-btn")) {
        const productId = e.target.closest(".cart-item-remove-btn").dataset.productId;
        removeItem(productId);
      }
    });

    // 선택 상품 삭제
    modalRoot.addEventListener("click", (e) => {
      if (e.target.closest("#cart-modal-remove-selected-btn")) {
        removeSelectedItems();
      }
    });

    // 전체 비우기
    modalRoot.addEventListener("click", (e) => {
      if (e.target.closest("#cart-modal-clear-cart-btn")) {
        clearCart();
      }
    });

    // 구매하기
    modalRoot.addEventListener("click", (e) => {
      if (e.target.closest("#cart-modal-checkout-btn")) {
        checkout();
      }
    });

    // 상품 클릭 (상세 페이지 이동)
    modalRoot.addEventListener("click", (e) => {
      const imageEl = e.target.closest(".cart-item-image");
      const titleEl = e.target.closest(".cart-item-title");

      if (imageEl || titleEl) {
        const productId = (imageEl || titleEl).dataset.productId;
        const router = Router();
        router.push(`/product/${productId}`);
        hide();
      }
    });
  };

  // 렌더링
  const render = () => {
    const modalRoot = initModalRoot();
    const state = cartStore.getState();

    if (!state.isOpen) {
      modalRoot.innerHTML = "";
      document.body.style.overflow = "";
      return;
    }

    modalRoot.innerHTML = CartModalTemplate({
      items: state.items,
      selectedIds: state.selectedIds,
    });

    document.body.style.overflow = "hidden";
    attachEventListeners();
  };

  // ===== Public API =====

  const show = () => {
    cartStore.setState({ isOpen: true });
    render();

    // ESC 키 이벤트 등록
    if (!escKeyHandler) {
      escKeyHandler = (e) => {
        if (e.key === "Escape" && cartStore.getState().isOpen) {
          hide();
        }
      };
      document.addEventListener("keydown", escKeyHandler);
    }
  };

  const hide = () => {
    cartStore.setState({ isOpen: false });
    render();

    // ESC 키 이벤트 제거
    if (escKeyHandler) {
      document.removeEventListener("keydown", escKeyHandler);
      escKeyHandler = null;
    }
  };

  const addItem = (product) => {
    const state = cartStore.getState();
    const existingItem = state.items.find((item) => item.productId === product.productId);

    console.log("addItem 호출:", product);
    console.log("기존 아이템:", existingItem);

    if (existingItem) {
      // 이미 있으면 수량 증가
      const addQuantity = product.quantity || 1;
      console.log("수량 증가:", existingItem.quantity, "+", addQuantity);

      cartStore.setState({
        items: state.items.map((item) =>
          item.productId === product.productId ? { ...item, quantity: item.quantity + addQuantity } : item,
        ),
      });
    } else {
      // 새로 추가 (맨 뒤에)
      const newQuantity = product.quantity || 1;
      console.log("새로 추가:", newQuantity, "개");

      cartStore.setState({
        items: [...state.items, { ...product, quantity: newQuantity }],
      });
    }

    render();
    Toast.show("SUCCESS", "장바구니에 추가되었습니다");
  };

  const removeItem = (productId) => {
    const state = cartStore.getState();
    cartStore.setState({
      items: state.items.filter((item) => item.productId !== productId),
      selectedIds: new Set([...state.selectedIds].filter((id) => id !== productId)),
    });
    render();
  };

  const updateQuantity = (productId, delta) => {
    const state = cartStore.getState();
    cartStore.setState({
      items: state.items.map((item) => {
        if (item.productId === productId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }),
    });
    render();
  };

  const toggleSelectItem = (productId, selected) => {
    const state = cartStore.getState();
    const newSelectedIds = new Set(state.selectedIds);

    if (selected) {
      newSelectedIds.add(productId);
    } else {
      newSelectedIds.delete(productId);
    }

    cartStore.setState({ selectedIds: newSelectedIds });
    render();
  };

  const toggleSelectAll = (selected) => {
    const state = cartStore.getState();
    const newSelectedIds = selected ? new Set(state.items.map((item) => item.productId)) : new Set();

    cartStore.setState({ selectedIds: newSelectedIds });
    render();
  };

  const removeSelectedItems = () => {
    const state = cartStore.getState();
    const selectedCount = state.selectedIds.size;

    if (selectedCount === 0) return;

    cartStore.setState({
      items: state.items.filter((item) => !state.selectedIds.has(item.productId)),
      selectedIds: new Set(),
    });

    render();
    Toast.show("INFO", `선택한 상품 ${selectedCount}개가 삭제되었습니다`);
  };

  const clearCart = () => {
    cartStore.setState({
      items: [],
      selectedIds: new Set(),
    });
    render();
    Toast.show("INFO", "장바구니가 비워졌습니다");
  };

  const checkout = () => {
    const state = cartStore.getState();
    if (state.items.length === 0) {
      Toast.show("ERROR", "장바구니가 비어있습니다");
      return;
    }

    // TODO: 구매 로직 구현
    Toast.show("INFO", "구매 기능은 준비 중입니다");
  };

  const getItemCount = () => {
    return cartStore.getState().items.length;
  };

  const getItems = () => {
    return cartStore.getState().items;
  };

  return {
    show,
    hide,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getItems,
  };
};

// 전역 CartModal 인스턴스
const CartModal = createCartModal();

export default CartModal;
