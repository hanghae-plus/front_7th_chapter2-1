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
const initCartStorage = () => {
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
const getCartData = () => {
  const cartData = localStorage.getItem("shopping_cart");
  if (!cartData) {
    return initCartStorage();
  }
  return JSON.parse(cartData);
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

// 모달 다이얼로그 컴포넌트
export const CartDialog = () => {
  // localStorage 초기화
  initCartStorage();

  // localStorage에서 장바구니 데이터 가져오기
  const cartData = getCartData();
  const { items } = cartData;

  // 컨텐츠 영역 렌더링 (items가 비어있으면 EmptyCart, 있으면 장바구니 아이템 목록)
  const renderCartContent = () => {
    if (items.length === 0) {
      return EmptyCart();
    }
    // TODO: 장바구니 아이템 목록 렌더링 (추후 구현)
    return EmptyCart();
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
    const { items } = cartData;
    const cartContent = document.getElementById("cart-content");

    if (cartContent) {
      if (items.length === 0) {
        cartContent.innerHTML = EmptyCart();
      } else {
        // TODO: 장바구니 아이템 목록 렌더링 (추후 구현)
        cartContent.innerHTML = EmptyCart();
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

  // 오버레이 클릭 시 닫기
  modalOverlay.addEventListener("click", (e) => {
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
