import { navigateTo } from "../router/navigation.js";
import { routes } from "../main.js";
import { addCartItem } from "../utils/cartStorage.js";
import { updateCartIconCount } from "../components/common/Header.js";
import { toast } from "../utils/toast.js";

/**
 * DetailPage의 이벤트 핸들러를 등록하는 함수
 */
export const setupDetailPageHandlers = () => {
  const container = document.querySelector("#root");
  if (!container) return;

  // 이벤트 위임을 사용하여 동적으로 생성된 요소의 이벤트도 처리
  const handleEvent = (e) => {
    const target = e.target;

    // 브레드크럼 클릭 처리
    if (target.classList.contains("breadcrumb-link") && e.type === "click") {
      e.preventDefault();

      const category1 = target.dataset.category1;
      const category2 = target.dataset.category2;

      // category1만 있으면 1depth 카테고리로 이동
      if (category1 && !category2) {
        navigateTo(routes, "/", { category1 });
      }
      // category2도 있으면 2depth 카테고리로 이동
      else if (category1 && category2) {
        navigateTo(routes, "/", { category1, category2 });
      }

      return;
    }

    // 수량 감소 버튼
    if (target.closest("#quantity-decrease") && e.type === "click") {
      const input = document.getElementById("quantity-input");
      if (input) {
        const currentValue = parseInt(input.value) || 1;
        const minValue = parseInt(input.min) || 1;
        if (currentValue > minValue) {
          input.value = currentValue - 1;
        }
      }
      return;
    }

    // 수량 증가 버튼
    if (target.closest("#quantity-increase") && e.type === "click") {
      const input = document.getElementById("quantity-input");
      if (input) {
        const currentValue = parseInt(input.value) || 1;
        const maxValue = parseInt(input.max) || Infinity;
        if (currentValue < maxValue) {
          input.value = currentValue + 1;
        }
      }
      return;
    }

    // 장바구니 담기 버튼
    if (target.id === "add-to-cart-btn" && e.type === "click") {
      const productInfo = document.querySelector("[data-product-id]");
      const quantityInput = document.getElementById("quantity-input");

      if (productInfo && quantityInput) {
        const productId = productInfo.dataset.productId;
        const title = productInfo.dataset.title;
        const price = Number(productInfo.dataset.price);
        const image = productInfo.dataset.image;
        const quantity = parseInt(quantityInput.value) || 1;

        const product = {
          id: productId,
          title,
          price,
          image,
        };

        addCartItem(product, quantity);
        toast.success("장바구니에 추가되었습니다");
        updateCartIconCount();
      }
      return;
    }
  };

  // 이벤트 리스너 등록
  container.addEventListener("click", handleEvent);

  // 클린업 함수 반환
  return () => {
    container.removeEventListener("click", handleEvent);
  };
};
