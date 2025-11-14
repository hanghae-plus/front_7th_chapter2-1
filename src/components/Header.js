import CartModal from "./CartModal.js";

// CartModal 인스턴스
let cartModalInstance = null;

// localStorage에서 장바구니 데이터 가져오기
const getCartCount = () => {
  try {
    const cartData = localStorage.getItem("shopping_cart");
    if (!cartData) return 0;

    const cart = JSON.parse(cartData);
    return cart.items.length;
  } catch (error) {
    console.error("장바구니 데이터 로드 실패:", error);
    return 0;
  }
};

// 장바구니 카운트를 업데이트하는 함수
const updateCartCount = () => {
  const cartCountElement = document.getElementById("cart-count-badge");
  if (cartCountElement) {
    const newCount = getCartCount();
    if (newCount > 0) {
      cartCountElement.textContent = newCount;
      cartCountElement.style.display = "flex";
    } else {
      cartCountElement.style.display = "none";
    }
  }
};

export const Header = () => {
  const cartCount = getCartCount();

  const pathname = window.location.pathname;
  const isDetailPage = pathname.includes("/product/");

  const ListTitle = () => {
    return (
      /* HTML */
      `
        <h1 class="text-xl font-bold text-gray-900">
          <a href="/" data-link="">쇼핑몰</a>
        </h1>
      `
    );
  };

  const DetailTitle = () => {
    return (
      /* HTML */
      `
        <div class="flex items-center space-x-3">
          <button onclick="window.history.back()" class="p-2 text-gray-700 hover:text-gray-900 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h1 class="text-lg font-bold text-gray-900">상품 상세</h1>
        </div>
      `
    );
  };

  // storage 이벤트 리스너 등록 (한 번만)
  if (!window.__cartEventListenerAdded) {
    window.addEventListener("storage", updateCartCount);
    window.__cartEventListenerAdded = true;
  }

  // CartModal 인스턴스 생성 (한 번만)
  if (!cartModalInstance) {
    cartModalInstance = CartModal();
  }

  // 장바구니 아이콘 클릭 이벤트 등록
  setTimeout(() => {
    const cartIconBtn = document.getElementById("cart-icon-btn");
    if (cartIconBtn && !cartIconBtn.__cartClickListenerAdded) {
      cartIconBtn.addEventListener("click", () => {
        cartModalInstance.open();
      });
      cartIconBtn.__cartClickListenerAdded = true;
    }
  }, 0);

  return (
    /* HTML */
    `
      <header class="bg-white shadow-sm sticky top-0 z-40">
        <div class="max-w-md mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            ${isDetailPage ? DetailTitle() : ListTitle()}
            <div class="flex items-center space-x-2">
              <!-- 장바구니 아이콘 -->
              <button id="cart-icon-btn" class="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"
                  ></path>
                </svg>
                <span
                  id="cart-count-badge"
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  style="display: ${cartCount > 0 ? "flex" : "none"}"
                  >${cartCount}</span
                >
              </button>
            </div>
          </div>
        </div>
      </header>
    `
  );
};

/*
example

key: shopping_cart
value: {"items":[{"id":"86940857379","title":"샷시 풍지판 창문 바람막이 베란다 문 틈막이 창틀 벌레 차단 샤시 방충망 틈새막이","image":"https://shopping-phinf.pstatic.net/main_8694085/86940857379.1.jpg","price":230,"quantity":4,"selected":true},{"id":"82094468339","title":"실리카겔 50g 습기제거제 제품 /산업 신발 의류 방습제","image":"https://shopping-phinf.pstatic.net/main_8209446/82094468339.4.jpg","price":280,"quantity":5,"selected":false},{"id":"82359253087","title":"방충망 셀프교체 미세먼지 롤 창문 모기장 알루미늄망 60cmX20cm","image":"https://shopping-phinf.pstatic.net/main_8235925/82359253087.18.jpg","price":420,"quantity":1,"selected":true}],"selectedAll":false}
*/
