import Component from "@/core/Component";
import ProductList from "@/components/ProductList";
import Footer from "@/components/Footer";
import Header from "../components/Header";
import Cart from "../components/Cart";
import { cartStore } from "@/core/store";

class HomePage extends Component {
  template() {
    return `
    <header class="header-container"></header>
    <section class="product_list"></section>
    <section class="cart-container"></section>
    ${Footer()}
    `;
  }

  setup() {
    // cartStore 구독하여 모달 상태 관리
    this.unsubscribe = cartStore.subscribe((newState) => {
      this.updateCartModal(newState.isOpen);
    });
  }

  mounted() {
    const $header = this.$target.querySelector(".header-container");
    const $productList = this.$target.querySelector(".product_list");
    const $cart = this.$target.querySelector(".cart-container");

    if ($header) {
      const headerComponent = new Header($header);
      this.addChildComponent(headerComponent);
    }

    if ($productList) {
      const productListComponent = new ProductList($productList);
      this.addChildComponent(productListComponent);
    }

    if ($cart) {
      const cartComponent = new Cart($cart);
      this.addChildComponent(cartComponent);
      // 초기 모달 상태 설정
      this.updateCartModal(cartStore.getState().isOpen);
    }
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

  unmount() {
    // cartStore 구독 해제
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    // 부모의 unmount 호출
    super.unmount();
  }
}

export default HomePage;
