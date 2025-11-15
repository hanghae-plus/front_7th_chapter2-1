import { store } from "../core/store.js";
import { showToast } from "./Toast.js";

const EmptyCart = /* html */ `
  <!-- 빈 장바구니 -->
  <div class="flex-1 flex items-center justify-center p-8">
    <div class="text-center">
      <div class="text-gray-400 mb-4">
        <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">장바구니가 비어있습니다</h3>
      <p class="text-gray-600">원하는 상품을 담아보세요!</p>
    </div>
  </div>
`;

const CartItems = ({ productId, image, title, lprice, quantity }) => {
  return /* html */ `
  <!-- 아이템 목록 -->
    <div class="flex items-center py-3 border-b border-gray-100 cart-item" data-product-id="${productId}">
      <!-- 선택 체크박스 -->
      <label class="flex items-center mr-3">
        <input type="checkbox" class="cart-item-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded 
      focus:ring-blue-500" data-product-id="${productId}">
      </label>
      <!-- 상품 이미지 -->
      <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
        <img src="${image}" alt="${title}" class="w-full h-full object-cover cursor-pointer cart-item-image" data-product-id="${productId}">
      </div>
      <!-- 상품 정보 -->
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-medium text-gray-900 truncate cursor-pointer cart-item-title" data-product-id="${productId}">
          ${title}
        </h4>
        <p class="text-sm text-gray-600 mt-1">
          ${Number(lprice).toLocaleString()}원
        </p>
        <!-- 수량 조절 -->
        <div class="flex items-center mt-2">
          <button class="quantity-decrease-btn w-7 h-7 flex items-center justify-center 
        border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100" data-product-id="${productId}">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
            </svg>
          </button>
          <input type="number" value="${quantity}" min="1" class="quantity-input w-12 h-7 text-center text-sm border-t border-b 
      border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500" disabled="" data-product-id="${productId}">
          <button class="quantity-increase-btn w-7 h-7 flex items-center justify-center 
        border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100" data-product-id="${productId}">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
      </div>
      <!-- 가격 및 삭제 -->
      <div class="text-right ml-3">
        <p class="text-sm font-medium text-gray-900">
          ${Number(lprice * quantity).toLocaleString()}원
        </p>
        <button class="cart-item-remove-btn mt-1 text-xs text-red-600 hover:text-red-800" data-product-id="${productId}">
          삭제
        </button>
      </div>
    </div>
  `;
};

const CartFooter = ({ total }) => {
  return /* html */ `
  <!-- 하단 액션 -->
  <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4">
    <!-- 선택된 아이템 정보 -->
    <!-- 총 금액 -->
    <div class="flex justify-between items-center mb-4">
      <span class="text-lg font-bold text-gray-900">총 금액</span>
      <span class="text-xl font-bold text-blue-600">${Number(total).toLocaleString()}원</span>
    </div>
    <!-- 액션 버튼들 -->
    <div class="space-y-2">
      <button id="cart-modal-remove-selected-btn" 
              class="w-full bg-red-600 text-white py-2 px-4 rounded-md 
                     hover:bg-red-700 transition-colors text-sm"
              style="display: none;">
        <span id="remove-selected-text">선택한 상품 삭제 (0개)</span>
      </button>
      <div class="flex gap-2">
        <button id="cart-modal-clear-cart-btn" class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md 
                  hover:bg-gray-700 transition-colors text-sm">
          전체 비우기
        </button>
        <button id="cart-modal-checkout-btn" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md 
                  hover:bg-blue-700 transition-colors text-sm">
          구매하기
        </button>
      </div>
    </div>
  </div>
  `;
};

export const CartModal = ({ items, total }) => {
  return /* html */ `
    <div class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
      <div class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
        <!-- 헤더 -->
        <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
            </svg>
            장바구니 ${items.length > 0 ? `(${items.length})` : ""}
          </h2>
          
          <button id="cart-modal-close-btn" class="text-gray-400 hover:text-gray-600 p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- 컨텐츠 -->
        <div class="flex flex-col max-h-[calc(90vh-120px)]">
          ${
            items.length > 0
              ? /* html */ `<!-- 전체 선택 섹션 -->
            <div class="p-4 border-b border-gray-200 bg-gray-50">
              <label class="flex items-center text-sm text-gray-700">
                <input type="checkbox" id="cart-modal-select-all-checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2">
                전체선택 (${items.length}개)
              </label>
            </div>
            <div class="flex-1 overflow-y-auto">
              <div class="p-4 space-y-4">
                ${items.map(CartItems).join("")}
              </div>
            </div>
            ${CartFooter({ total })}
            `
              : EmptyCart
          }
        </div>
      </div>
    </div>
  `;
};

// 모달 관리
let modalContainer = null;
let modalOverlay = null;
let escKeyHandler = null;

const createModalContainer = () => {
  // 오버레이 생성
  modalOverlay = document.createElement("div");
  modalOverlay.id = "cart-modal-overlay";
  modalOverlay.className = "fixed inset-0 bg-black bg-opacity-50 z-50 modal-overlay";
  modalOverlay.style.cssText = "display: none;";

  // 모달 컨테이너 생성
  modalContainer = document.createElement("div");
  modalContainer.id = "cart-modal-container";
  modalContainer.className = "fixed inset-0 z-50";
  modalContainer.style.cssText = "display: none;";

  document.body.appendChild(modalOverlay);
  document.body.appendChild(modalContainer);
};

// 모달 열기
export const openCartModal = () => {
  if (!modalContainer) {
    createModalContainer();
  }
  const { items, total } = store.state.cart;

  // 모달 렌더링
  modalContainer.innerHTML = CartModal({ items, total });
  modalContainer.style.display = "block";
  modalOverlay.style.display = "block";
  document.body.style.overflow = "hidden";

  setupModalEvents();

  // 배경 클릭 시 모달 닫기
  modalContainer.addEventListener("click", (e) => {
    const modalContent = e.target.closest(".relative");
    if (!modalContent) {
      closeCartModal();
    }
  });

  // ESC 키로 모달 닫기
  escKeyHandler = (e) => {
    if (e.key === "Escape") {
      closeCartModal();
    }
  };
  document.addEventListener("keydown", escKeyHandler);
};

// 선택된 체크박스 개수 업데이트
const updateSelectedCount = () => {
  const checkboxes = document.querySelectorAll(".cart-item-checkbox");
  const selectedCount = Array.from(checkboxes).filter((cb) => cb.checked).length;

  const removeBtn = document.getElementById("cart-modal-remove-selected-btn");
  const removeText = document.getElementById("remove-selected-text");

  if (removeBtn && removeText) {
    removeText.textContent = `선택한 상품 삭제 (${selectedCount}개)`;
    removeBtn.style.display = selectedCount > 0 ? "block" : "none";
  }
};

// 모달 내부 이벤트 리스너 설정
const setupModalEvents = () => {
  // 닫기 버튼
  const closeBtn = document.getElementById("cart-modal-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeCartModal);
  }

  // 전체선택 체크박스
  const selectAllCheckbox = document.getElementById("cart-modal-select-all-checkbox");
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", (e) => {
      const isChecked = e.target.checked;
      document.querySelectorAll(".cart-item-checkbox").forEach((checkbox) => {
        checkbox.checked = isChecked;
      });
      updateSelectedCount();
    });
  }

  // 개별 체크박스
  document.querySelectorAll(".cart-item-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      // 전체선택 체크박스 상태 업데이트
      const allCheckboxes = document.querySelectorAll(".cart-item-checkbox");
      const allChecked = Array.from(allCheckboxes).every((cb) => cb.checked);
      const selectAllCheckbox = document.getElementById("cart-modal-select-all-checkbox");
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = allChecked;
      }
      updateSelectedCount();
    });
  });

  // 선택한 상품 삭제 버튼
  const removeSelectedBtn = document.getElementById("cart-modal-remove-selected-btn");
  if (removeSelectedBtn) {
    removeSelectedBtn.addEventListener("click", () => {
      const selectedCheckboxes = document.querySelectorAll(".cart-item-checkbox:checked");
      const selectedProductIds = Array.from(selectedCheckboxes).map((cb) => cb.dataset.productId);

      if (selectedProductIds.length > 0) {
        selectedProductIds.forEach((productId) => {
          store.removeFromCart(productId);
        });
        showToast.info(`선택된 상품들이 삭제되었습니다`);
        openCartModal();
      }
    });
  }

  // 수량 증가 버튼들
  document.querySelectorAll(".quantity-increase-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const productId = e.currentTarget.dataset.productId;
      const currentItem = store.state.cart.items.find((item) => item.productId === productId);

      if (currentItem) {
        store.updateCartQuantity(productId, currentItem.quantity + 1);
        openCartModal();
      }
    });
  });

  // 수량 감소 버튼들
  document.querySelectorAll(".quantity-decrease-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const productId = e.currentTarget.dataset.productId;
      const currentItem = store.state.cart.items.find((item) => item.productId === productId);

      if (currentItem) {
        if (currentItem.quantity > 1) {
          store.updateCartQuantity(productId, currentItem.quantity - 1);
        }
        openCartModal();
      }
    });
  });

  // 삭제 버튼들
  document.querySelectorAll(".cart-item-remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const productId = e.currentTarget.dataset.productId;

      store.removeFromCart(productId);
      openCartModal();
    });
  });

  // 전체 비우기 버튼
  const clearCartBtn = document.getElementById("cart-modal-clear-cart-btn");
  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      store.clearCart();
      showToast.info("장바구니가 비워졌습니다");
      openCartModal();
    });
  }

  // 구매하기 버튼
  const checkoutBtn = document.getElementById("cart-modal-checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      showToast.info("구매 기능은 추후 구현 예정입니다");
    });
  }

  // 상품 이미지/제목 클릭 시 상세 페이지로 이동
  document.querySelectorAll(".cart-item-image, .cart-item-title").forEach((element) => {
    element.addEventListener("click", (e) => {
      const productId = e.currentTarget.dataset.productId;
      closeCartModal();
      import("../core/router.js").then(({ router }) => {
        router.navigate(`/product/${productId}`);
      });
    });
  });
};

// 모달 닫기
export const closeCartModal = () => {
  if (modalContainer) {
    modalContainer.style.display = "none";
    modalContainer.innerHTML = "";
  }
  if (modalOverlay) {
    modalOverlay.style.display = "none";
  }

  // ESC 키 이벤트 리스너 제거
  if (escKeyHandler) {
    document.removeEventListener("keydown", escKeyHandler);
    escKeyHandler = null;
  }

  // body 스크롤 복원
  document.body.style.overflow = "";
};
