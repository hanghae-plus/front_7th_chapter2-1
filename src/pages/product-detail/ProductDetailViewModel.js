import { getProduct, getProducts } from "../../api/productApi";
import { cartStore } from "../../stores/cart-store";
import { showToast } from "../../utils/toast";

export class ProductDetailViewModel {
  constructor(productId) {
    this.productId = productId;
    this.state = {
      product: null,
      quantity: 1,
      relatedProducts: [],
      isLoading: true,
      error: null,
    };

    // 옵저버 패턴으로 View에 상태 변경 알림
    this.observers = [];
  }

  // View 구독
  subscribe(callback) {
    this.observers.push(callback);
  }

  unsubscribe(callback) {
    this.observers = this.observers.filter((observer) => observer !== callback);
  }

  // 상태 변경 시 모든 구독자에게 알림
  notify() {
    this.observers.forEach((callback) => callback(this.state));
  }

  // 상태 업데이트
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  // 초기 데이터 로드
  async init() {
    try {
      const product = await getProduct(this.productId);
      this.setState({ product, isLoading: false });
      await this.initRelatedProducts();
    } catch (error) {
      this.setState({ isLoading: false, error });
    }
  }

  // 관련 상품 로드
  async initRelatedProducts() {
    if (!this.state.product) return;

    try {
      const relatedProducts = await getProducts({ category2: this.state.product.category2 });
      this.setState({
        relatedProducts: relatedProducts.products.filter(
          (product) => product.productId !== this.state.product.productId,
        ),
      });
    } catch (error) {
      this.setState({ error });
    }
  }

  // 수량 증가
  handleQuantityIncrease() {
    this.setState({ quantity: this.state.quantity + 1 });
  }

  // 수량 감소
  handleQuantityDecrease() {
    this.setState({ quantity: Math.max(1, this.state.quantity - 1) });
  }

  // 장바구니 추가
  handleAddToCart() {
    const product = this.state.product;
    cartStore.addItem(product, this.state.quantity);
    this.setState({ quantity: 1 });

    showToast({ type: "success", message: "장바구니에 추가되었습니다" });
  }

  // 관련 상품 클릭
  handleRelatedProductClick(productId) {
    return productId;
  }

  // 홈으로 이동
  handleGoToHome() {
    // Navigation will be handled by the view
  }

  // 카테고리 필터 이동
  handleCategoryFilter(category1, category2) {
    return { category1, category2 };
  }
}
