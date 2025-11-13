// 장바구니 버튼 컴포넌트
export const CartButton = () => {
  return /*html*/ `
    <button id="cart-icon-btn" class="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
        </svg>
    </button>
  `;
};

// localStorage 초기화
export const initCartStorage = () => {
  const cartData = localStorage.getItem("shopping_cart");
  if (!cartData) {
    const initialCart = {
      items: [],
      selectedAll: false,
    };
    localStorage.setItem("shopping_cart", JSON.stringify(initialCart));
    return initialCart;
  }
  return JSON.parse(cartData);
};

// localStorage에서 장바구니 데이터 가져오기
export const getCartData = () => {
  const cartData = localStorage.getItem("shopping_cart");
  if (!cartData) {
    return initCartStorage();
  }
  return JSON.parse(cartData);
};

// localStorage에 장바구니 데이터 저장
export const saveCartData = (cartData) => {
  localStorage.setItem("shopping_cart", JSON.stringify(cartData));
};

// 빈 장바구니 컴포넌트
export const EmptyCart = () => {
  return /*html*/ `
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
};

// 장바구니 아이템 컴포넌트
export const CartItem = (item) => {
  return /*html*/ `
    <div class="flex items-center py-3 border-b border-gray-100 cart-item" data-product-id="${item.id}">
      <!-- 선택 체크박스 -->
      <label class="flex items-center mr-3">
        <input type="checkbox" class="cart-item-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded
      focus:ring-blue-500" data-product-id="${item.id}" ${item.selected ? "checked" : ""}>
      </label>
      <!-- 상품 이미지 -->
      <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
        <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover cursor-pointer cart-item-image" data-product-id="${item.id}">
      </div>
      <!-- 상품 정보 -->
      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-medium text-gray-900 truncate cursor-pointer cart-item-title" data-product-id="${item.id}">
          ${item.title}
        </h4>
        <p class="text-sm text-gray-600 mt-1">
          ${parseInt(item.price || 0).toLocaleString()}원
        </p>
        <!-- 수량 조절 -->
        <div class="flex items-center mt-2">
          <button class="quantity-decrease-btn w-7 h-7 flex items-center justify-center
       border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100" data-product-id="${item.id}">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
            </svg>
          </button>
          <input type="number" value="${item.quantity}" min="1" class="quantity-input w-12 h-7 text-center text-sm border-t border-b
      border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500" disabled="" data-product-id="${item.id}">
          <button class="quantity-increase-btn w-7 h-7 flex items-center justify-center
       border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100" data-product-id="${item.id}">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
          </button>
        </div>
      </div>
      <!-- 가격 및 삭제 -->
      <div class="text-right ml-3">
        <p class="text-sm font-medium text-gray-900">
          ${(parseInt(item.price || 0) * (item.quantity || 1)).toLocaleString()}원
        </p>
        <button class="cart-item-remove-btn mt-1 text-xs text-red-600 hover:text-red-800" data-product-id="${item.id}">
          삭제
        </button>
      </div>
    </div>
  `;
};

// 장바구니 아이템 목록 컴포넌트
export const CartItemsList = (items, selectedAll = false) => {
  // 총 금액 계산
  const totalAmount = items.reduce((sum, item) => {
    const price = parseInt(item.price) || 0;
    const quantity = item.quantity || 1;
    return sum + price * quantity;
  }, 0);

  return /*html*/ `
    <!-- 전체 선택 섹션 -->
    <div class="p-4 border-b border-gray-200 bg-gray-50">
      <label class="flex items-center text-sm text-gray-700">
        <input type="checkbox" id="cart-modal-select-all-checkbox" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2" ${selectedAll ? "checked" : ""}>
        전체선택 (${items.length}개)
      </label>
    </div>
    <!-- 아이템 목록 -->
    <div class="flex-1 overflow-y-auto">
      <div class="p-4 space-y-4">
        ${items.map((item) => CartItem(item)).join("")}
      </div>
    </div>
    <!-- 하단 액션 -->
    <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4">
      <!-- 총 금액 -->
      <div class="flex justify-between items-center mb-4">
        <span class="text-lg font-bold text-gray-900">총 금액</span>
        <span class="text-xl font-bold text-blue-600">${totalAmount.toLocaleString()}원</span>
      </div>
      <!-- 액션 버튼들 -->
      <div class="space-y-2">
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

// 모달 다이얼로그 컴포넌트
export const CartDialog = () => {
  // localStorage에서 장바구니 데이터 가져오기
  const cartData = getCartData();
  const { items } = cartData;

  // 컨텐츠 영역 렌더링 (items가 비어있으면 EmptyCart, 있으면 장바구니 아이템 목록)
  const renderCartContent = () => {
    if (items.length === 0) {
      return EmptyCart();
    }
    return CartItemsList(items, cartData.selectedAll || false);
  };

  return /*html*/ `
    <!-- 모달 오버레이 -->
    <div id="cart-modal-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden modal-overlay">
      <div class="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
        <div class="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
          <!-- 헤더 -->
          <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-900 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
              </svg>
              장바구니
              ${items.length > 0 ? `<span class="text-sm font-normal text-gray-600 ml-1">(${items.length})</span>` : ""}
            </h2>

            <button id="cart-modal-close-btn" class="text-gray-400 hover:text-gray-600 p-1">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- 컨텐츠 -->
          <div class="flex flex-col max-h-[calc(90vh-120px)]" id="cart-content">
            ${renderCartContent()}
          </div>
        </div>
      </div>
    </div>
  `;
};

// CartDialog 초기화 및 이벤트 리스너 설정
let isInitialized = false;

export const initCartDialog = () => {
  // 이미 초기화되었으면 스킵
  if (isInitialized) {
    // 버튼 이벤트만 다시 연결 (페이지가 다시 렌더링될 수 있으므로)
    const cartIconBtn = document.getElementById("cart-icon-btn");
    if (cartIconBtn && !cartIconBtn.dataset.cartListener) {
      cartIconBtn.addEventListener("click", window.openCartDialog);
      cartIconBtn.dataset.cartListener = "true";
    }
    return;
  }

  // 모달 오버레이 요소 확인
  const modalOverlay = document.getElementById("cart-modal-overlay");
  if (!modalOverlay) {
    return; // 모달이 없으면 초기화하지 않음 (Header에서 추가해야 함)
  }

  // 장바구니 컨텐츠 업데이트 함수 (외부에서도 사용 가능하도록 export)
  window.updateCartContent = () => {
    const cartData = getCartData();
    const { items, selectedAll } = cartData;
    const cartContent = document.getElementById("cart-content");
    const cartHeader = document.querySelector("#cart-modal-overlay h2");

    if (cartContent) {
      if (items.length === 0) {
        cartContent.innerHTML = EmptyCart();
      } else {
        cartContent.innerHTML = CartItemsList(items, selectedAll || false);
      }
    }

    // 헤더의 장바구니 개수 업데이트
    if (cartHeader) {
      const countSpan = cartHeader.querySelector("span");
      if (items.length > 0) {
        if (!countSpan) {
          const span = document.createElement("span");
          span.className = "text-sm font-normal text-gray-600 ml-1";
          span.textContent = `(${items.length})`;
          cartHeader.appendChild(span);
        } else {
          countSpan.textContent = `(${items.length})`;
        }
      } else if (countSpan) {
        countSpan.remove();
      }
    }
  };

  // 모달 열기 함수 (외부에서도 사용 가능하도록 export)
  window.openCartDialog = () => {
    const overlay = document.getElementById("cart-modal-overlay");
    if (overlay) {
      // 모달을 열 때마다 최신 장바구니 데이터로 업데이트
      window.updateCartContent();
      overlay.classList.remove("hidden");
      // body 스크롤 방지
      document.body.style.overflow = "hidden";
    }
  };

  // 모달 닫기 함수 (외부에서도 사용 가능하도록 export)
  window.closeCartDialog = () => {
    const overlay = document.getElementById("cart-modal-overlay");
    if (overlay) {
      overlay.classList.add("hidden");
      // body 스크롤 복원
      document.body.style.overflow = "";
    }
  };

  // 장바구니 버튼 클릭 이벤트 (Header의 cart-icon-btn)
  const cartIconBtn = document.getElementById("cart-icon-btn");
  if (cartIconBtn) {
    cartIconBtn.addEventListener("click", window.openCartDialog);
    cartIconBtn.dataset.cartListener = "true";
  }

  // 닫기 버튼 클릭 이벤트
  const closeBtn = document.getElementById("cart-modal-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", window.closeCartDialog);
  }

  // 오버레이 클릭 이벤트 (오버레이 닫기, 삭제 버튼, 수량 조절 버튼, 전체 비우기 버튼 처리)
  modalOverlay.addEventListener("click", (e) => {
    // 전체 비우기 버튼 클릭 처리
    const clearCartBtn = e.target.closest("#cart-modal-clear-cart-btn");
    if (clearCartBtn) {
      const cartData = getCartData();
      cartData.items = [];
      cartData.selectedAll = false;
      saveCartData(cartData);
      window.updateCartContent();
      return;
    }

    // 수량 증가 버튼 클릭 처리
    const increaseBtn = e.target.closest(".quantity-increase-btn");
    if (increaseBtn) {
      const productId = increaseBtn.getAttribute("data-product-id");
      if (productId) {
        const cartData = getCartData();
        const item = cartData.items.find((item) => item.id === productId);
        if (item) {
          item.quantity = (item.quantity || 1) + 1;
          saveCartData(cartData);
          window.updateCartContent();
        }
      }
      return;
    }

    // 수량 감소 버튼 클릭 처리
    const decreaseBtn = e.target.closest(".quantity-decrease-btn");
    if (decreaseBtn) {
      const productId = decreaseBtn.getAttribute("data-product-id");
      if (productId) {
        const cartData = getCartData();
        const item = cartData.items.find((item) => item.id === productId);
        if (item && item.quantity > 1) {
          item.quantity = item.quantity - 1;
          saveCartData(cartData);
          window.updateCartContent();
        }
      }
      return;
    }

    // 삭제 버튼 클릭 처리
    const removeBtn = e.target.closest(".cart-item-remove-btn");
    if (removeBtn) {
      const productId = removeBtn.getAttribute("data-product-id");
      if (productId) {
        // 로컬 스토리지에서 해당 아이템 제거
        const cartData = getCartData();
        cartData.items = cartData.items.filter((item) => item.id !== productId);

        // 선택된 아이템이 없으면 전체 선택 해제
        if (cartData.items.length === 0) {
          cartData.selectedAll = false;
        } else {
          // 선택된 아이템이 있는지 확인하여 selectedAll 업데이트
          const hasSelected = cartData.items.some((item) => item.selected);
          if (!hasSelected) {
            cartData.selectedAll = false;
          }
        }

        // 로컬 스토리지에 저장
        saveCartData(cartData);

        // 장바구니 컨텐츠 업데이트
        window.updateCartContent();
      }
      return; // 삭제 버튼 클릭 시 오버레이 닫기 이벤트 방지
    }

    // 오버레이 자체를 클릭했을 때만 닫기 (내부 컨텐츠 클릭 시에는 닫지 않음)
    if (e.target === modalOverlay) {
      window.closeCartDialog();
    }
  });

  // ESC 키로 닫기 (한 번만 등록)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const overlay = document.getElementById("cart-modal-overlay");
      if (overlay && !overlay.classList.contains("hidden")) {
        window.closeCartDialog();
      }
    }
  });

  // 초기 렌더링 시 장바구니 컨텐츠 업데이트
  window.updateCartContent();

  isInitialized = true;
};
