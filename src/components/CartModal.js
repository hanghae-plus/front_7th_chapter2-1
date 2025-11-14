import router from "../Router.js";

// 토스트 메시지 표시 함수
const showToast = (message, type = "success") => {
  // 애니메이션 스타일 추가 (한 번만)
  if (!document.getElementById("toast-animations")) {
    const style = document.createElement("style");
    style.id = "toast-animations";
    style.textContent = `
      @keyframes slideDown {
        from {
          transform: translate(-50%, -100%);
          opacity: 0;
        }
        to {
          transform: translate(-50%, 0);
          opacity: 1;
        }
      }
      @keyframes slideUp {
        from {
          transform: translate(-50%, 0);
          opacity: 1;
        }
        to {
          transform: translate(-50%, -100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 기존 토스트 제거
  const existingToast = document.getElementById("toast-container");
  if (existingToast) {
    existingToast.remove();
  }

  // 토스트 컨테이너 생성
  const toastContainer = document.createElement("div");
  toastContainer.id = "toast-container";
  toastContainer.className = "fixed top-4 left-1/2 transform -translate-x-1/2 z-50";
  toastContainer.style.animation = "slideDown 0.3s ease-out";

  // 타입에 따른 스타일 설정
  let bgColor, icon;
  if (type === "success") {
    bgColor = "bg-green-600";
    icon = /* HTML */ `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
    `;
  } else if (type === "error") {
    bgColor = "bg-red-600";
    icon = /* HTML */ `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    `;
  } else {
    bgColor = "bg-blue-600";
    icon = /* HTML */ `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    `;
  }

  toastContainer.innerHTML = /* HTML */ `
    <div class="flex flex-col gap-2 items-center justify-center mx-auto" style="width: fit-content;">
      <div class="${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
        <div class="flex-shrink-0">${icon}</div>
        <p class="text-sm font-medium">${message}</p>
        <button id="toast-close-btn" class="flex-shrink-0 ml-2 text-white hover:text-gray-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(toastContainer);

  // 닫기 버튼 이벤트
  const closeBtn = toastContainer.querySelector("#toast-close-btn");
  closeBtn.addEventListener("click", () => {
    toastContainer.remove();
  });

  // 3초 후 자동 제거
  setTimeout(() => {
    if (toastContainer.parentElement) {
      toastContainer.style.animation = "slideUp 0.3s ease-in";
      setTimeout(() => {
        toastContainer.remove();
      }, 300);
    }
  }, 3000);
};

// localStorage에서 장바구니 데이터 가져오기
const getCartData = () => {
  try {
    const cartData = localStorage.getItem("shopping_cart");
    if (!cartData) return { items: [], selectedAll: false };
    return JSON.parse(cartData);
  } catch (error) {
    console.error("장바구니 데이터 로드 실패:", error);
    return { items: [], selectedAll: false };
  }
};

// localStorage에 장바구니 데이터 저장
const saveCartData = (cart) => {
  try {
    localStorage.setItem("shopping_cart", JSON.stringify(cart));
    // Header의 카운트 업데이트
    window.dispatchEvent(new Event("storage"));
  } catch (error) {
    console.error("장바구니 데이터 저장 실패:", error);
  }
};

const CartModal = () => {
  let modalContainer = null;

  const render = () => {
    const cart = getCartData();
    const { items } = cart;

    // 빈 장바구니
    if (items.length === 0) {
      return renderEmptyCart();
    }

    // 선택된 아이템이 있는지 확인
    const hasSelected = items.some((item) => item.selected);

    if (hasSelected) {
      return renderCartWithSelected(items);
    } else {
      return renderCartWithoutSelected(items);
    }
  };

  const renderEmptyCart = () => {
    return /* HTML */ `
      <div class="flex-1 flex items-center justify-center p-8">
        <div class="text-center">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">장바구니가 비어있습니다</h3>
          <p class="text-gray-600">원하는 상품을 담아보세요!</p>
        </div>
      </div>
    `;
  };

  const renderCartItem = (item) => {
    const { id, title, image, price, quantity, selected } = item;
    const totalPrice = price * quantity;

    return /* HTML */ `
      <div class="flex items-center py-3 border-b border-gray-100 cart-item" data-product-id="${id}">
        <!-- 선택 체크박스 -->
        <label class="flex items-center mr-3">
          <input
            type="checkbox"
            ${selected ? "checked" : ""}
            class="cart-item-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded
            focus:ring-blue-500"
            data-product-id="${id}"
          />
        </label>
        <!-- 상품 이미지 -->
        <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
          <img
            src="${image}"
            alt="${title}"
            class="w-full h-full object-cover cursor-pointer cart-item-image"
            data-product-id="${id}"
          />
        </div>
        <!-- 상품 정보 -->
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-medium text-gray-900 truncate cursor-pointer cart-item-title" data-product-id="${id}">
            ${title}
          </h4>
          <p class="text-sm text-gray-600 mt-1">${Number(price).toLocaleString()}원</p>
          <!-- 수량 조절 -->
          <div class="flex items-center mt-2">
            <button
              class="quantity-decrease-btn w-7 h-7 flex items-center justify-center
             border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100"
              data-product-id="${id}"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
              </svg>
            </button>
            <input
              type="number"
              value="${quantity}"
              min="1"
              class="quantity-input w-12 h-7 text-center text-sm border-t border-b
            border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled
              data-product-id="${id}"
            />
            <button
              class="quantity-increase-btn w-7 h-7 flex items-center justify-center
             border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
              data-product-id="${id}"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
          </div>
        </div>
        <!-- 가격 및 삭제 -->
        <div class="text-right ml-3">
          <p class="text-sm font-medium text-gray-900">${totalPrice.toLocaleString()}원</p>
          <button class="cart-item-remove-btn mt-1 text-xs text-red-600 hover:text-red-800" data-product-id="${id}">
            삭제
          </button>
        </div>
      </div>
    `;
  };

  const renderCartWithSelected = (items) => {
    const selectedItems = items.filter((item) => item.selected);
    const selectedCount = selectedItems.length;
    const selectedTotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const allTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const allSelected = items.length === selectedCount;

    return /* HTML */ `
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
        <div class="p-4 space-y-4">${items.map((item) => renderCartItem(item)).join("")}</div>
      </div>
      <!-- 하단 액션 -->
      <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <!-- 선택된 아이템 정보 -->
        <div class="flex justify-between items-center mb-3 text-sm">
          <span class="text-gray-600">선택한 상품 (${selectedCount}개)</span>
          <span class="font-medium">${selectedTotal.toLocaleString()}원</span>
        </div>
        <!-- 총 금액 -->
        <div class="flex justify-between items-center mb-4">
          <span class="text-lg font-bold text-gray-900">총 금액</span>
          <span class="text-xl font-bold text-blue-600">${allTotal.toLocaleString()}원</span>
        </div>
        <!-- 액션 버튼들 -->
        <div class="space-y-2">
          <button
            id="cart-modal-remove-selected-btn"
            class="w-full bg-red-600 text-white py-2 px-4 rounded-md
                   hover:bg-red-700 transition-colors text-sm"
          >
            선택한 상품 삭제 (${selectedCount}개)
          </button>
          <div class="flex gap-2">
            <button
              id="cart-modal-clear-cart-btn"
              class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md
                   hover:bg-gray-700 transition-colors text-sm"
            >
              전체 비우기
            </button>
            <button
              id="cart-modal-checkout-btn"
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md
                   hover:bg-blue-700 transition-colors text-sm"
            >
              구매하기
            </button>
          </div>
        </div>
      </div>
    `;
  };

  const renderCartWithoutSelected = (items) => {
    const allTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return /* HTML */ `
      <!-- 전체 선택 섹션 -->
      <div class="p-4 border-b border-gray-200 bg-gray-50">
        <label class="flex items-center text-sm text-gray-700">
          <input
            type="checkbox"
            id="cart-modal-select-all-checkbox"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
          />
          전체선택 (${items.length}개)
        </label>
      </div>
      <!-- 아이템 목록 -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-4 space-y-4">${items.map((item) => renderCartItem(item)).join("")}</div>
      </div>
      <!-- 하단 액션 -->
      <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <!-- 총 금액 -->
        <div class="flex justify-between items-center mb-4">
          <span class="text-lg font-bold text-gray-900">총 금액</span>
          <span class="text-xl font-bold text-blue-600">${allTotal.toLocaleString()}원</span>
        </div>
        <!-- 액션 버튼들 -->
        <div class="space-y-2">
          <div class="flex gap-2">
            <button
              id="cart-modal-clear-cart-btn"
              class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md
                       hover:bg-gray-700 transition-colors text-sm"
            >
              전체 비우기
            </button>
            <button
              id="cart-modal-checkout-btn"
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md
                       hover:bg-blue-700 transition-colors text-sm"
            >
              구매하기
            </button>
          </div>
        </div>
      </div>
    `;
  };

  const updateModal = () => {
    if (!modalContainer) return;

    const contentContainer = modalContainer.querySelector(".cart-modal-content");
    if (contentContainer) {
      contentContainer.innerHTML = render();
      addEventListeners();
    }
  };

  const addEventListeners = () => {
    if (!modalContainer) return;

    // 개별 체크박스 클릭
    const itemCheckboxes = modalContainer.querySelectorAll(".cart-item-checkbox");
    itemCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const productId = e.target.dataset.productId;
        const cart = getCartData();
        const item = cart.items.find((item) => item.id === productId);
        if (item) {
          item.selected = e.target.checked;
          saveCartData(cart);
          updateModal();
        }
      });
    });

    // 전체 선택 체크박스
    const selectAllCheckbox = modalContainer.querySelector("#cart-modal-select-all-checkbox");
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener("change", (e) => {
        const cart = getCartData();
        cart.items.forEach((item) => {
          item.selected = e.target.checked;
        });
        cart.selectedAll = e.target.checked;
        saveCartData(cart);
        updateModal();
      });
    }

    // 수량 증가 버튼
    const increaseButtons = modalContainer.querySelectorAll(".quantity-increase-btn");
    increaseButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const productId = button.dataset.productId;
        const cart = getCartData();
        const item = cart.items.find((item) => item.id === productId);
        if (item) {
          item.quantity += 1;
          saveCartData(cart);
          updateModal();
        }
      });
    });

    // 수량 감소 버튼
    const decreaseButtons = modalContainer.querySelectorAll(".quantity-decrease-btn");
    decreaseButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const productId = button.dataset.productId;
        const cart = getCartData();
        const item = cart.items.find((item) => item.id === productId);
        if (item && item.quantity > 1) {
          item.quantity -= 1;
          saveCartData(cart);
          updateModal();
        }
      });
    });

    // 삭제 버튼
    const removeButtons = modalContainer.querySelectorAll(".cart-item-remove-btn");
    removeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const productId = button.dataset.productId;
        const cart = getCartData();
        cart.items = cart.items.filter((item) => item.id !== productId);
        saveCartData(cart);
        showToast("상품이 삭제되었습니다.", "success");
        updateModal();
      });
    });

    // 선택한 상품 삭제 버튼
    const removeSelectedBtn = modalContainer.querySelector("#cart-modal-remove-selected-btn");
    if (removeSelectedBtn) {
      removeSelectedBtn.addEventListener("click", () => {
        const cart = getCartData();
        const selectedCount = cart.items.filter((item) => item.selected).length;
        if (selectedCount === 0) {
          showToast("선택한 상품이 없습니다.", "error");
          return;
        }
        cart.items = cart.items.filter((item) => !item.selected);
        saveCartData(cart);
        showToast("선택한 상품이 삭제되었습니다.", "success");
        updateModal();
      });
    }

    // 전체 비우기 버튼
    const clearCartBtn = modalContainer.querySelector("#cart-modal-clear-cart-btn");
    if (clearCartBtn) {
      clearCartBtn.addEventListener("click", () => {
        const cart = getCartData();
        if (cart.items.length === 0) {
          showToast("장바구니가 이미 비어있습니다.", "error");
          return;
        }
        saveCartData({ items: [], selectedAll: false });
        showToast("장바구니가 비워졌습니다.", "success");
        updateModal();
      });
    }

    // 구매하기 버튼
    const checkoutBtn = modalContainer.querySelector("#cart-modal-checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        showToast("구매 기능은 추후 구현 예정입니다.", "info");
      });
    }

    // 상품 이미지, 제목 클릭 시 상세 페이지 이동
    const itemImages = modalContainer.querySelectorAll(".cart-item-image");
    const itemTitles = modalContainer.querySelectorAll(".cart-item-title");

    [...itemImages, ...itemTitles].forEach((element) => {
      element.addEventListener("click", () => {
        const productId = element.dataset.productId;
        close();
        router.push(`${import.meta.env.BASE_URL}product/${productId}`);
      });
    });
  };

  const open = () => {
    // 기존 모달이 있으면 제거
    const existingModal = document.getElementById("cart-modal-overlay");
    if (existingModal) {
      existingModal.remove();
    }

    // 모달 컨테이너 생성
    modalContainer = document.createElement("div");
    modalContainer.className = "fixed inset-0 z-50 overflow-y-auto cart-modal";

    const cart = getCartData();
    const itemCount = cart.items.length;

    modalContainer.innerHTML = /* HTML */ `
      <!-- 배경 오버레이 -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity cart-modal-overlay"></div>
      <div class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4 cart-modal-wrapper">
        <div
          class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden cart-modal-content-wrapper"
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
                ></path>
              </svg>
              장바구니
              ${itemCount > 0 ? `<span class="text-sm font-normal text-gray-600 ml-1">(${itemCount})</span>` : ""}
            </h2>
            <button id="cart-modal-close-btn" class="text-gray-400 hover:text-gray-600 p-1">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <!-- 컨텐츠 -->
          <div class="flex flex-col max-h-[calc(90vh-120px)] cart-modal-content">${render()}</div>
        </div>
      </div>
    `;

    document.querySelector("#root").appendChild(modalContainer);

    // 닫기 버튼 이벤트
    const closeBtn = modalContainer.querySelector("#cart-modal-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", close);
    }

    // 오버레이 또는 wrapper 클릭 시 닫기 (모달 컨텐츠 제외)
    const overlay = modalContainer.querySelector(".cart-modal-overlay");
    const wrapper = modalContainer.querySelector(".cart-modal-wrapper");

    if (overlay) {
      overlay.addEventListener("click", close);
    }

    if (wrapper) {
      wrapper.addEventListener("click", (e) => {
        // wrapper를 직접 클릭했을 때만 닫기 (자식 요소 클릭은 제외)
        if (e.target === wrapper) {
          close();
        }
      });
    }

    // 이벤트 리스너 추가
    addEventListeners();

    // body 스크롤 방지
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    if (modalContainer) {
      modalContainer.remove();
      modalContainer = null;
      document.body.style.overflow = "";
    }
  };

  return {
    open,
    close,
  };
};

export default CartModal;
