import Store from "../Store.js";

/**
 * 장바구니 상태 관리 Store
 * - 장바구니 아이템 관리
 * - localStorage와 자동 동기화
 */
class CartStore extends Store {
  constructor() {
    // localStorage에서 초기 상태 로드 (super 호출 전에 static 메서드처럼 호출)
    const savedCart = CartStore.loadFromStorage();
    super({
      items: savedCart.items || [],
      totalCount: savedCart.totalCount || 0,
      totalPrice: savedCart.totalPrice || 0,
      isOpen: false, // 모달 열림/닫힘 상태
    });

    // 초기 계산
    this.calculateTotals();
  }

  /**
   * localStorage에서 장바구니 데이터 로드 (static 메서드)
   */
  static loadFromStorage() {
    try {
      const cartData = localStorage.getItem("shopping_cart");
      if (cartData) {
        return JSON.parse(cartData);
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
    }
    return { items: [], totalCount: 0, totalPrice: 0 };
  }

  /**
   * localStorage에 장바구니 데이터 저장
   */
  saveToStorage() {
    try {
      const { items, totalCount, totalPrice } = this.state;
      localStorage.setItem("shopping_cart", JSON.stringify({ items, totalCount, totalPrice }));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }

  /**
   * 총 개수 및 총 금액 계산
   */
  calculateTotals() {
    const items = this.state.items || [];
    const totalCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

    this.setState({ totalCount, totalPrice });
    this.saveToStorage();
  }

  /**
   * 장바구니에 상품 추가
   * @param {Object} product - 추가할 상품 정보
   * @param {number} quantity - 수량 (기본값: 1)
   */
  addItem(product, quantity = 1) {
    const items = [...(this.state.items || [])];
    const existingIndex = items.findIndex((item) => item.productId === product.productId);

    if (existingIndex >= 0) {
      // 이미 있는 상품이면 수량 증가
      items[existingIndex].quantity += quantity;
    } else {
      // 새로운 상품 추가
      items.push({
        productId: product.productId,
        title: product.title,
        image: product.image,
        price: Number(product.lprice),
        quantity,
      });
    }

    this.setState({ items });
    this.calculateTotals();
  }

  /**
   * 장바구니에서 상품 제거
   * @param {string} productId - 제거할 상품 ID
   */
  removeItem(productId) {
    const items = (this.state.items || []).filter((item) => item.productId !== productId);
    this.setState({ items });
    this.calculateTotals();
  }

  /**
   * 상품 수량 업데이트
   * @param {string} productId - 상품 ID
   * @param {number} quantity - 새로운 수량
   */
  updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const items = (this.state.items || []).map((item) => (item.productId === productId ? { ...item, quantity } : item));
    this.setState({ items });
    this.calculateTotals();
  }

  /**
   * 선택된 상품들 제거
   * @param {string[]} productIds - 제거할 상품 ID 배열
   */
  removeSelected(productIds) {
    const items = (this.state.items || []).filter((item) => !productIds.includes(item.productId));
    this.setState({ items });
    this.calculateTotals();
  }

  /**
   * 장바구니 비우기
   */
  clearCart() {
    this.setState({ items: [], totalCount: 0, totalPrice: 0 });
    this.saveToStorage();
  }

  /**
   * 상품이 장바구니에 있는지 확인
   * @param {string} productId - 상품 ID
   * @returns {boolean}
   */
  hasItem(productId) {
    return (this.state.items || []).some((item) => item.productId === productId);
  }

  /**
   * 특정 상품의 수량 조회
   * @param {string} productId - 상품 ID
   * @returns {number}
   */
  getItemQuantity(productId) {
    const item = (this.state.items || []).find((item) => item.productId === productId);
    return item ? item.quantity : 0;
  }

  /**
   * 장바구니 모달 열기
   */
  openCart() {
    this.setState({ isOpen: true });
  }

  /**
   * 장바구니 모달 닫기
   */
  closeCart() {
    this.setState({ isOpen: false });
  }

  /**
   * 장바구니 모달 토글
   */
  toggleCart() {
    this.setState({ isOpen: !this.state.isOpen });
  }
}

// 싱글톤 인스턴스 생성 및 export
export const cartStore = new CartStore();
