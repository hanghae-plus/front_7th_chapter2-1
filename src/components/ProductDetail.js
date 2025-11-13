import { cartStore } from "../store/cartStore";
import { Toast } from "./Toast";
import { push } from "../main";

const createDetailHandler = () => {
  const insertCart = (product) => {
    const $insertCartBtn = document.querySelector("#add-to-cart-btn");
    if ($insertCartBtn) {
      $insertCartBtn.addEventListener("click", () => {
        const $quantityInput = document.querySelector("#quantity-input");
        const quantity = parseInt($quantityInput.value) || 1;

        cartStore.addItem(
          {
            productId: product.productId,
            title: product.title,
            image: product.image,
            lprice: product.lprice,
          },
          quantity,
        );
        Toast({ result: "success" });
      });
    }
  };

  const increaseQuantity = () => {
    const $increaseBtn = document.querySelector("#quantity-increase");
    const $inputValue = document.querySelector("#quantity-input");
    if ($increaseBtn) {
      $increaseBtn.addEventListener("click", () => {
        const currentValue = parseInt($inputValue.value) || 1;
        const maxValue = parseInt($inputValue.max) || 999;
        const newValue = Math.min(currentValue + 1, maxValue);
        $inputValue.value = newValue;
      });
    }
  };

  const decreaseQuantity = () => {
    const $decreaseBtn = document.querySelector("#quantity-decrease");
    const $inputValue = document.querySelector("#quantity-input");
    if ($decreaseBtn) {
      $decreaseBtn.addEventListener("click", () => {
        const currentValue = parseInt($inputValue.value) || 1;
        const minValue = parseInt($inputValue.min) || 1;
        const newValue = Math.max(currentValue - 1, minValue);
        $inputValue.value = newValue;
      });
    }
  };

  const breadCrumb = () => {
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("breadcrumb-link")) {
        // category2가 있으면 category2를 우선 처리 (category2 버튼에는 category1도 함께 있음)
        if (e.target.dataset.category2) {
          const category1 = e.target.dataset.category1;
          const category2 = e.target.dataset.category2;
          push(
            `${import.meta.env.BASE_URL}?category1=${encodeURIComponent(category1)}&category2=${encodeURIComponent(category2)}`,
          );
        } else if (e.target.dataset.category1) {
          const category1 = e.target.dataset.category1;
          push(`${import.meta.env.BASE_URL}?category1=${encodeURIComponent(category1)}`);
        }
      }
    });
  };

  return {
    insertCart,
    increaseQuantity,
    decreaseQuantity,
    breadCrumb,
  };
};

export const detailHandler = createDetailHandler();
