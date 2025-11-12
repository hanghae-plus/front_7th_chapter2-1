import { getProduct, getProducts } from "../../lib/api/productApi.js";
import { PageLayout, Header, CartIconButton } from "../../components/index.js";
import { formatCurrency, escapeHtml } from "../../lib/utils/format.js";
import * as productDetailActions from "../../store/actions/productDetailActions.js";
import * as cartActions from "../../store/actions/cartActions.js";
import * as filterActions from "../../store/actions/filterActions.js";

/**
 * 상품 상세 페이지 컨트롤러
 */
export class ProductDetailPage {
  constructor(app) {
    this.app = app;
  }

  async load(productId) {
    productDetailActions.startProductLoad(this.app.store);

    this.renderLoading();

    try {
      const product = await getProduct(productId);

      if (!product || product.productId !== productId) {
        throw new Error("상품을 찾을 수 없습니다.");
      }

      let relatedProducts = [];
      if (product.category2) {
        const relatedData = await getProducts({
          category1: product.category1 || "",
          category2: product.category2 || "",
          limit: 10,
        });
        relatedProducts = relatedData.products.filter((p) => p.productId !== productId).slice(0, 4);
      }

      productDetailActions.setProductSuccess(this.app.store, product, relatedProducts);

      this.renderContent();
    } catch (error) {
      console.error("상품 상세 정보를 불러오는 중 오류가 발생했습니다.", error);
      productDetailActions.setProductError(this.app.store, error?.message || "상품 정보를 불러올 수 없습니다.");
      this.renderError();
    }
  }

  renderLoading() {
    const detailHeaderLeft = /*html*/ `
      <div class="flex items-center space-x-3">
        <button onclick="window.history.back()" class="p-2 text-gray-700 hover:text-gray-900 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="text-lg font-bold text-gray-900">상품 상세</h1>
      </div>
    `;

    const content = /*html*/ `
      <div class="max-w-4xl mx-auto px-4 py-6">
        <div class="py-20 bg-gray-50 flex items-center justify-center rounded-lg">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600">상품 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    `;

    const cartCount = this.app.getCartCount();
    this.app.rootElement.innerHTML = PageLayout({
      header: Header({
        leftContent: detailHeaderLeft,
        rightContent: CartIconButton({ count: cartCount }),
      }),
      children: content,
    });
  }

  renderError() {
    const detailHeaderLeft = /*html*/ `
      <div class="flex items-center space-x-3">
        <button onclick="window.history.back()" class="p-2 text-gray-700 hover:text-gray-900 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="text-lg font-bold text-gray-900">상품 상세</h1>
      </div>
    `;

    const content = /*html*/ `
      <div class="max-w-4xl mx-auto px-4 py-6">
        <div class="py-20 bg-red-50 rounded-lg">
          <div class="text-center">
            <p class="text-red-600 mb-4">${escapeHtml(this.app.detailState.error || "오류가 발생했습니다.")}</p>
            <button onclick="window.history.back()" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    `;

    const cartCount = this.app.getCartCount();
    this.app.rootElement.innerHTML = PageLayout({
      header: Header({
        leftContent: detailHeaderLeft,
        rightContent: CartIconButton({ count: cartCount }),
      }),
      children: content,
    });
  }

  renderContent() {
    const product = this.app.detailState.product;
    if (!product) return;

    const quantity = this.app.detailState.quantity;

    const detailHeaderLeft = /*html*/ `
      <div class="flex items-center space-x-3">
        <button id="detail-back-btn" class="p-2 text-gray-700 hover:text-gray-900 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="text-lg font-bold text-gray-900">상품 상세</h1>
      </div>
    `;

    let breadcrumb = /*html*/ `
      <a href="/" class="hover:text-blue-600 transition-colors" data-link>홈</a>
    `;

    if (product.category1) {
      breadcrumb += /*html*/ `
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
        <button class="breadcrumb-category1" data-category1="${escapeHtml(product.category1)}">
          ${escapeHtml(product.category1)}
        </button>
      `;
    }

    if (product.category2) {
      breadcrumb += /*html*/ `
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
        <button class="breadcrumb-category2" data-category1="${escapeHtml(product.category1)}" data-category2="${escapeHtml(product.category2)}">
          ${escapeHtml(product.category2)}
        </button>
      `;
    }

    const relatedProductsHtml = this.app.detailState.relatedProducts
      .map(
        (p) => /*html*/ `
      <div class="bg-gray-50 rounded-lg p-3 related-product-card cursor-pointer hover:bg-gray-100 transition-colors" data-product-id="${escapeHtml(p.productId)}">
        <div class="aspect-square bg-white rounded-md overflow-hidden mb-2">
          <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" class="w-full h-full object-cover" loading="lazy">
        </div>
        <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">${escapeHtml(p.title)}</h3>
        <p class="text-sm font-bold text-blue-600">${formatCurrency(p.lprice)}원</p>
      </div>
    `,
      )
      .join("");

    const content = /*html*/ `
      <div class="max-w-4xl mx-auto px-4 py-6">
        <nav class="mb-4">
          <div class="flex items-center space-x-2 text-sm text-gray-600">
            ${breadcrumb}
          </div>
        </nav>
        
        <div class="bg-white rounded-lg shadow-sm mb-6">
          <div class="p-4">
            <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" class="w-full h-full object-cover product-detail-image">
            </div>
            <div>
              ${product.brand ? `<p class="text-sm text-gray-600 mb-1">${escapeHtml(product.brand)}</p>` : ""}
              <h1 class="text-xl font-bold text-gray-900 mb-3">${escapeHtml(product.title)}</h1>
              <div class="mb-4">
                <span class="text-2xl font-bold text-blue-600">${formatCurrency(product.lprice)}원</span>
              </div>
              <div class="text-sm text-gray-700 leading-relaxed mb-6">
                ${escapeHtml(product.title)}에 대한 상세 설명입니다.
              </div>
            </div>
          </div>
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
                <input type="number" id="quantity-input" value="${quantity}" min="1" class="w-16 h-8 text-center text-sm border-t border-b border-gray-300 
                  focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <button id="quantity-increase" class="w-8 h-8 flex items-center justify-center border border-gray-300 
                  rounded-r-md bg-gray-50 hover:bg-gray-100">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </button>
              </div>
            </div>
            <button id="add-to-cart-btn" data-product-id="${escapeHtml(product.productId)}" class="w-full bg-blue-600 text-white py-3 px-4 rounded-md 
              hover:bg-blue-700 transition-colors font-medium">
              장바구니 담기
            </button>
          </div>
        </div>
        
        <div class="mb-6">
          <button class="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md 
            hover:bg-gray-200 transition-colors go-to-product-list">
            상품 목록으로 돌아가기
          </button>
        </div>
        
        ${
          this.app.detailState.relatedProducts.length > 0
            ? /*html*/ `
          <div class="bg-white rounded-lg shadow-sm">
            <div class="p-4 border-b border-gray-200">
              <h2 class="text-lg font-bold text-gray-900">관련 상품</h2>
              <p class="text-sm text-gray-600">같은 카테고리의 다른 상품들</p>
            </div>
            <div class="p-4">
              <div class="grid grid-cols-2 gap-3">
                ${relatedProductsHtml}
              </div>
            </div>
          </div>
        `
            : ""
        }
      </div>
    `;

    const cartCount = this.app.getCartCount();
    this.app.rootElement.innerHTML = PageLayout({
      header: Header({
        leftContent: detailHeaderLeft,
        rightContent: CartIconButton({ count: cartCount }),
      }),
      children: content,
    });
    this.attachHandlers();
  }

  attachHandlers() {
    const quantityDecrease = this.app.rootElement.querySelector("#quantity-decrease");
    const quantityIncrease = this.app.rootElement.querySelector("#quantity-increase");
    const quantityInput = this.app.rootElement.querySelector("#quantity-input");
    const addToCartBtn = this.app.rootElement.querySelector("#add-to-cart-btn");
    const goToListBtn = this.app.rootElement.querySelector(".go-to-product-list");
    const relatedProductCards = this.app.rootElement.querySelectorAll(".related-product-card");
    const breadcrumbCategory1 = this.app.rootElement.querySelector(".breadcrumb-category1");
    const breadcrumbCategory2 = this.app.rootElement.querySelector(".breadcrumb-category2");
    const homeLink = this.app.rootElement.querySelector("[data-link]");
    const cartButton = this.app.rootElement.querySelector("#cart-icon-btn");
    const detailBackBtn = this.app.rootElement.querySelector("#detail-back-btn");

    if (detailBackBtn) {
      detailBackBtn.addEventListener("click", () => {
        window.history.back();
      });
    }

    if (cartButton) {
      cartButton.addEventListener("click", (event) => {
        event.preventDefault();
        this.app.openCartModal();
      });
    }

    if (homeLink) {
      homeLink.addEventListener("click", (event) => {
        event.preventDefault();
        this.app.navigateTo("/");
      });
    }

    if (breadcrumbCategory1) {
      breadcrumbCategory1.addEventListener("click", () => {
        const category1 = breadcrumbCategory1.dataset.category1;
        filterActions.setCategory(this.app.store, {
          category1: category1 || "",
          category2: "",
        });
        this.app.navigateTo("/");
      });
    }

    if (breadcrumbCategory2) {
      breadcrumbCategory2.addEventListener("click", () => {
        const category1 = breadcrumbCategory2.dataset.category1;
        const category2 = breadcrumbCategory2.dataset.category2;
        filterActions.setCategory(this.app.store, {
          category1: category1 || "",
          category2: category2 || "",
        });
        this.app.navigateTo("/");
      });
    }

    if (quantityDecrease) {
      quantityDecrease.addEventListener("click", () => {
        const currentQuantity = this.app.detailState.quantity;
        if (currentQuantity > 1) {
          this.app.detailState.quantity = currentQuantity - 1;
          if (quantityInput) quantityInput.value = String(this.app.detailState.quantity);
        }
      });
    }

    if (quantityIncrease) {
      quantityIncrease.addEventListener("click", () => {
        this.app.detailState.quantity += 1;
        if (quantityInput) quantityInput.value = String(this.app.detailState.quantity);
      });
    }

    if (quantityInput) {
      quantityInput.addEventListener("change", (e) => {
        const value = Number.parseInt(e.target.value, 10);
        if (!Number.isNaN(value) && value >= 1) {
          this.app.detailState.quantity = value;
        } else {
          this.app.detailState.quantity = 1;
          e.target.value = "1";
        }
      });
    }

    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", () => {
        const productId = addToCartBtn.dataset.productId;
        if (productId) {
          this.handleAddToCart(productId, this.app.detailState.quantity);
        }
      });
    }

    if (goToListBtn) {
      goToListBtn.addEventListener("click", () => {
        this.app.navigateTo("/");
      });
    }

    relatedProductCards.forEach((card) => {
      card.addEventListener("click", () => {
        const productId = card.dataset.productId;
        if (productId) {
          this.app.navigateTo(`/product/${productId}`);
        }
      });
    });
  }

  handleAddToCart(productId, quantity) {
    if (!productId || !this.app.detailState.product) {
      return;
    }

    const product = this.app.detailState.product;

    // 기존 장바구니 아이템 확인
    const existingIndex = this.app.cartItems.findIndex((item) => item.productId === productId);

    if (existingIndex >= 0) {
      // 기존 아이템의 수량에 추가
      const existingItem = this.app.cartItems[existingIndex];
      const newQuantity = this.app.getCartItemQuantity(existingItem) + quantity;
      cartActions.updateCartItemQuantity(this.app.store, productId, newQuantity);
    } else {
      // 새 아이템 추가 (수량 지정)
      const cartProduct = {
        productId,
        title: product.title ?? "",
        price: product.lprice ?? "",
        image: product.image ?? "",
        brand: product.brand ?? "",
      };

      // addToCart는 수량 1로 추가하므로, 여러 번 호출하거나 직접 설정
      cartActions.addToCart(this.app.store, cartProduct);

      // 수량이 1보다 크면 업데이트
      if (quantity > 1) {
        cartActions.updateCartItemQuantity(this.app.store, productId, quantity);
      }
    }

    this.app.saveCartToStorage();
    this.app.updateCartIcon();

    if (this.app.cartState.isOpen) {
      this.app.updateCartModalView();
    }

    this.app.showToast("장바구니에 추가되었습니다", "success");
  }
}
