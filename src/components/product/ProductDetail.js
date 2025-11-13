import { Component } from "@/core/Component";
import CartModal from "@/components/common/CartModal";

const ProductDetail = Component({
  initialState: () => ({
    quantity: 1,
  }),

  template: (context) => {
    const { props, state } = context;
    const product = props.product;
    if (!product) {
      return "";
    }

    const maxStock = product.stock || 999;

    return /* HTML */ `
      <div class="bg-white rounded-lg shadow-sm mb-6">
        <!-- 상품 이미지 -->
        <div class="p-4">
          <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img
              src="${product.image}"
              alt="${product.title}"
              class="w-full h-full object-cover product-detail-image"
            />
          </div>
          <!-- 상품 정보 -->
          <div>
            <p class="text-sm text-gray-600 mb-1">${product.brand || product.maker}</p>
            <h1 class="text-xl font-bold text-gray-900 mb-3">${product.title}</h1>
            <!-- 평점 및 리뷰 -->
            <div class="flex items-center mb-3">
              <div class="flex items-center">
                ${(() => {
                  const rating = product.rating || 0;
                  const filledStars = Math.floor(rating);
                  const emptyStars = 5 - filledStars;

                  const starSVG = (filled) => `
                    <svg class="w-4 h-4 ${filled ? "text-yellow-400" : "text-gray-300"}" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  `;

                  return starSVG(true).repeat(filledStars) + starSVG(false).repeat(emptyStars);
                })()}
              </div>
              <span class="ml-2 text-sm text-gray-600"
                >${product.rating || "0"} (${Number(product.reviewCount).toLocaleString() || 0}개 리뷰)</span
              >
            </div>
            <!-- 가격 -->
            <div class="mb-4">
              <span class="text-2xl font-bold text-blue-600">${Number(product.lprice).toLocaleString()}원</span>
            </div>
            <!-- 재고 -->
            <div class="text-sm text-gray-600 mb-4">재고 ${maxStock}개</div>
            <!-- 설명 -->
            <div class="text-sm text-gray-700 leading-relaxed mb-6">${product.description || product.title}</div>
          </div>
        </div>
        <!-- 수량 선택 및 액션 -->
        <div class="border-t border-gray-200 p-4">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-medium text-gray-900">수량</span>
            <div class="flex items-center">
              <button
                id="quantity-decrease"
                class="w-8 h-8 flex items-center justify-center border border-gray-300
                   rounded-l-md bg-gray-50 hover:bg-gray-100"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                </svg>
              </button>
              <input
                type="number"
                id="quantity-input"
                value="${state.quantity}"
                min="1"
                max="${maxStock}"
                class="w-16 h-8 text-center text-sm border-t border-b border-gray-300
                  focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                id="quantity-increase"
                class="w-8 h-8 flex items-center justify-center border border-gray-300
                   rounded-r-md bg-gray-50 hover:bg-gray-100"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
              </button>
            </div>
          </div>
          <!-- 액션 버튼 -->
          <button
            id="add-to-cart-btn"
            data-product-id="${product.productId}"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-md
                 hover:bg-blue-700 transition-colors font-medium"
          >
            장바구니 담기
          </button>
        </div>
      </div>
    `;
  },

  setEvent: ({ addEvent, props, setState }) => {
    const product = props.product;
    if (!product) return;

    const maxStock = product.stock || 999;

    // 수량 감소
    addEvent("#quantity-decrease", "click", () => {
      setState((prevState) => ({
        quantity: Math.max(1, prevState.quantity - 1),
      }));
    });

    // 수량 증가
    addEvent("#quantity-increase", "click", () => {
      setState((prevState) => ({
        quantity: Math.min(maxStock, prevState.quantity + 1),
      }));
    });

    // 수량 직접 입력
    addEvent("#quantity-input", "change", (e) => {
      let value = parseInt(e.target.value) || 1;
      value = Math.max(1, Math.min(maxStock, value));
      setState({ quantity: value });
    });

    // 장바구니 담기
    addEvent("#add-to-cart-btn", "click", () => {
      // input에서 직접 최신 수량 가져오기 (클로저 문제 회피)
      const quantityInput = document.querySelector("#quantity-input");
      const currentQuantity = parseInt(quantityInput?.value) || 1;

      CartModal.addItem({
        productId: product.productId,
        title: product.title,
        image: product.image,
        price: Number(product.lprice),
        quantity: currentQuantity,
      });

      console.log("장바구니에 추가:", currentQuantity, "개");
    });
  },
});

export default ProductDetail;
