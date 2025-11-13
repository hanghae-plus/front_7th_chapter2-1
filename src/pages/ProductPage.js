import Component from "@/core/Component";
import { getProduct } from "@/api/productApi";
import { getPickPath } from "../utils/urls";
import Footer from "@/components/Footer";
import ProductHeader from "../components/ProductHeader";
import CartModal from "@/components/CartModal";
import Toast from "@/components/Toast";
import { cartStore } from "@/core/store";
import { navigateTo } from "../router";
import { getProducts } from "../api/productApi";

class ProductPage extends Component {
  initState() {
    return { loading: true, quantity: 1 };
  }
  didMount() {
    window.scrollTo(0, 0);
  }
  template() {
    const { loading, product } = this.state;
    if (loading || !product) {
      return `
      <header class="header-container"></header>
      <div class="min-h-screen bg-gray-50">
      <main class="max-w-md mx-auto px-4 py-4 pt-[88px]">
        <div class="py-20 bg-gray-50 flex items-center justify-center">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600">상품 정보를 불러오는 중...</p>
          </div>
        </div>
      </main>
    </div>
    <section class="cart-container"></section>
    <section class="toast-container"></section>
    ${Footer()}
      `;
    }
    return `
    <header class="header-container"></header>
    <div class="min-h-screen bg-gray-50">
      <main class="max-w-md mx-auto px-4 py-4 pt-[88px]">
        <!-- 브레드크럼 -->
        <nav class="mb-4">
          <div class="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/" data-link="" class="hover:text-blue-600 transition-colors">홈</a>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <button class="breadcrumb-link" data-category1="생활/건강">
              생활/건강
            </button>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <button class="breadcrumb-link" data-category2="생활용품">
              생활용품
            </button>
          </div>
        </nav>
        <!-- 상품 상세 정보 -->
        <div class="bg-white rounded-lg shadow-sm mb-6">
          <!-- 상품 이미지 -->
          <div class="p-4">
            <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img src=${product.image} alt=${product.title} class="w-full h-full object-cover product-detail-image">
            </div>
            <!-- 상품 정보 -->
            <div>
              <p class="text-sm text-gray-600 mb-1"></p>
              <h1 class="text-xl font-bold text-gray-900 mb-3">${product.description}</h1>
              <!-- 평점 및 리뷰 -->
              <div class="flex items-center mb-3">
                <div class="flex items-center">
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
                <span class="ml-2 text-sm text-gray-600">4.0 (749개 리뷰)</span>
              </div>
              <!-- 가격 -->
              <div class="mb-4">
                <span class="text-2xl font-bold text-blue-600">${Number(product.lprice).toLocaleString()}원</span>
              </div>
              <!-- 재고 -->
              <div class="text-sm text-gray-600 mb-4">
                재고 ${product.stock}개
              </div>
              <!-- 설명 -->
              <div class="text-sm text-gray-700 leading-relaxed mb-6">
                ${product.description}
              </div>
            </div>
          </div>
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
                <input type="number" id="quantity-input" value="${this.state.quantity || 1}" min="1" max="${product?.stock || 107}" class="w-16 h-8 text-center text-sm border-t border-b border-gray-300 
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
            <button id="add-to-cart-btn" data-product-id="${product?.productId || ""}" class="w-full bg-blue-600 text-white py-3 px-4 rounded-md 
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
          <div class="p-4">
            <div class="grid grid-cols-2 gap-3 responsive-grid">
              ${this.state.relatedProducts
                .map(
                  (p) => `
                <div class="bg-gray-50 rounded-lg p-3 related-product-card cursor-pointer" data-product-id="${p.productId}">
                <div class="aspect-square bg-white rounded-md overflow-hidden mb-2">
                  <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover" loading="lazy">
                </div>
                <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">${p.title}</h3>
                <p class="text-sm font-bold text-blue-600">${Number(p.lprice).toLocaleString()}원</p>
              </div>
                `,
                )
                .join("")}
            </div>
          </div>
        </div>
      </main>
    </div>
    <section class="cart-container"></section>
    <section class="toast-container"></section>
    ${Footer()}
    `;
  }

  async fetchData() {
    const productId = this.$props?.productId || getPickPath("/product/");
    const product = await getProduct(productId);
    return product;
  }

  setup() {
    // cartStore 구독하여 모달 상태 관리
    this.unsubscribe = cartStore.subscribe((newState) => {
      this.updateCartModal(newState.isOpen);
    });

    // 장바구니 버튼 클릭 이벤트 관찰
    this.observeCartButtonClick();
  }

  /**
   * 장바구니 버튼 클릭 이벤트 관찰
   */
  observeCartButtonClick() {
    // 장바구니 추가 이벤트 리스너
    this.cartButtonClickHandler = () => {
      this.showToast("success", "장바구니에 추가되었습니다");
    };

    // 장바구니 삭제 이벤트 리스너
    this.cartItemRemovedHandler = () => {
      this.showToast("info", "선택된 상품들이 삭제되었습니다");
    };

    // 전역 이벤트 리스너로 등록
    document.addEventListener("cart:item-added", this.cartButtonClickHandler);
    document.addEventListener("cart:item-removed", this.cartItemRemovedHandler);
  }

  async mounted() {
    // Header 컴포넌트 생성 및 등록
    const $header = this.$target.querySelector(".header-container");
    if ($header) {
      const headerComponent = new ProductHeader($header);
      this.addChildComponent(headerComponent);
      this.headerComponent = headerComponent;
    }

    // CartModal 컴포넌트 생성 및 등록
    const $cart = this.$target.querySelector(".cart-container");
    if ($cart) {
      const cartComponent = new CartModal($cart);
      this.addChildComponent(cartComponent);
      this.cartComponent = cartComponent;
      // 초기 모달 상태 설정
      this.updateCartModal(cartStore.getState().isOpen);
    }

    // Toast 컴포넌트 생성 및 등록
    const $toast = this.$target.querySelector(".toast-container");
    if ($toast) {
      const toastComponent = new Toast($toast, {
        status: null,
        text: "",
      });
      this.addChildComponent(toastComponent);
      this.toastComponent = toastComponent;
    }

    // 데이터 로드
    const product = await this.fetchData();
    // 연관 상품
    const relatedProducts = await this.getRelatedProducts(product.category1);

    this.setState({ product, relatedProducts, loading: false });
  }

  /**
   * 연관 상품 호출
   */
  async getRelatedProducts(category) {
    if (this.$props?.products) {
      return this.$props.products.filter((p) => p.productId !== this.$props?.productId).slice(0, 2);
    }
    const res = await getProducts({ page: 1, limit: 3, category1: category });
    return res.products.slice(0, 2);
  }

  /**
   * 장바구니 모달 표시/숨김 업데이트
   */
  updateCartModal(isOpen) {
    const $cartModal = this.$target.querySelector(".cart-modal");
    if ($cartModal) {
      $cartModal.style.display = isOpen ? "block" : "none";
    }
  }

  /**
   * Toast 메시지 표시
   * @param {string} status - 'success', 'info', 'error'
   * @param {string} text - 표시할 메시지
   */
  showToast(status, text) {
    if (this.toastComponent) {
      this.toastComponent.$props = {
        status,
        text,
      };
      this.toastComponent.render();

      // Toast 표시
      const $toast = this.toastComponent.$target.querySelector(".toast-message");
      if ($toast) {
        $toast.style.display = "block";
      }

      // 3초 후 자동으로 숨기기
      if (this.toastTimer) {
        clearTimeout(this.toastTimer);
      }
      this.toastTimer = setTimeout(() => {
        this.hideToast();
      }, 3000);
    }
  }

  /**
   * Toast 메시지 숨기기
   */
  hideToast() {
    if (this.toastComponent && this.toastComponent.hide) {
      this.toastComponent.hide();
    }
  }

  // render 후 자식 컴포넌트 재마운트
  updated() {
    const $header = this.$target.querySelector(".header-container");
    if ($header) {
      // 기존 컴포넌트가 없거나 DOM이 교체된 경우에만 재생성
      if (!this.headerComponent || !$header.contains(this.headerComponent.$target)) {
        if (this.headerComponent) {
          this.headerComponent.unmount();
          const index = this.$childComponents.indexOf(this.headerComponent);
          if (index > -1) this.$childComponents.splice(index, 1);
        }
        const headerComponent = new ProductHeader($header);
        this.addChildComponent(headerComponent);
        this.headerComponent = headerComponent;
      }
    }

    const $cart = this.$target.querySelector(".cart-container");
    if ($cart) {
      // 기존 컴포넌트가 없거나 DOM이 교체된 경우에만 재생성
      if (!this.cartComponent || !$cart.contains(this.cartComponent.$target)) {
        if (this.cartComponent) {
          this.cartComponent.unmount();
          const index = this.$childComponents.indexOf(this.cartComponent);
          if (index > -1) this.$childComponents.splice(index, 1);
        }
        const cartComponent = new CartModal($cart);
        this.addChildComponent(cartComponent);
        this.cartComponent = cartComponent;
      }
    }

    // Toast 재마운트 (DOM이 교체되었을 수 있음)
    const $toast = this.$target.querySelector(".toast-container");
    if ($toast) {
      // 기존 컴포넌트가 없거나 DOM이 교체된 경우에만 재생성
      if (!this.toastComponent || !$toast.contains(this.toastComponent.$target)) {
        if (this.toastComponent) {
          this.toastComponent.unmount();
          const index = this.$childComponents.indexOf(this.toastComponent);
          if (index > -1) this.$childComponents.splice(index, 1);
        }
        const toastComponent = new Toast($toast, {
          status: null,
          text: "",
        });
        this.addChildComponent(toastComponent);
        this.toastComponent = toastComponent;
      }
    }
  }

  setEvent() {
    // 수량 감소
    this.addEvent("click", "#quantity-decrease", () => {
      const currentQuantity = this.state.quantity || 1;
      if (currentQuantity > 1) {
        this.setState({ quantity: currentQuantity - 1 });
      }
    });

    // 수량 증가
    this.addEvent("click", "#quantity-increase", () => {
      const { product } = this.state;
      const maxQuantity = product?.stock || 107;
      const currentQuantity = this.state.quantity || 1;
      if (currentQuantity < maxQuantity) {
        this.setState({ quantity: currentQuantity + 1 });
      }
    });

    // 수량 직접 입력
    this.addEvent("change", "#quantity-input", (e) => {
      const { product } = this.state;
      const maxQuantity = product?.stock || 107;
      const inputValue = parseInt(e.target.value, 10);
      if (inputValue && inputValue > 0 && inputValue <= maxQuantity) {
        this.setState({ quantity: inputValue });
      } else {
        // 유효하지 않은 값이면 현재 수량으로 복원
        e.target.value = this.state.quantity || 1;
      }
    });

    // 장바구니 담기 버튼 클릭
    this.addEvent("click", "#add-to-cart-btn", () => {
      const { product, quantity } = this.state;
      if (!product) return;

      // cartStore에 상품 추가
      cartStore.addItem(product, quantity || 1);

      // 커스텀 이벤트 발생 (HomePage에서 Toast 표시를 위해)
      const cartEvent = new CustomEvent("cart:item-added", {
        detail: { product },
      });
      document.dispatchEvent(cartEvent);
    });

    this.addEvent("click", ".go-to-product-list", () => {
      navigateTo("/");
    });

    this.addEvent("click", ".related-product-card", (e) => {
      const productId = e.target.closest(".related-product-card")?.dataset.productId;
      if (productId) {
        this.goProductPage(productId);
      }
    });
  }

  unmount() {
    // Toast 타이머 정리
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    // cartStore 구독 해제
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    // 장바구니 버튼 클릭 이벤트 리스너 해제
    if (this.cartButtonClickHandler) {
      document.removeEventListener("cart:item-added", this.cartButtonClickHandler);
    }
    if (this.cartItemRemovedHandler) {
      document.removeEventListener("cart:item-removed", this.cartItemRemovedHandler);
    }
    // 부모의 unmount 호출
    super.unmount();
  }

  goProductPage(id) {
    navigateTo(`/product/${id}`, { productId: id });
  }
}

export default ProductPage;
