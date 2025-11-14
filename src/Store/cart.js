/**
 * 옵저버 패턴 상세 내용
 *
 * 관찰 대상 (Subject): Cart 클래스의 인스턴스 (최하단에 생성한 cartStore)
 *      --> 싱글톤 패턴 활용 (하나의 Cart 스토어의 인스턴스를 모든 컴포넌트에서 공유하게 하기 위함)
 * 상태 (State): #state (Object)
 * 구독자 목록 (Observers): #observer (Set)
 * 구독 (Subscribe): subscribe() 메서드.
 * 알림 (Notify): #setState()가 호출되면 #notify() 메서드 호출.
 * */

const initialState = {
  items: [], // { productId, title, image, lprice, quantity, isChecked }
  isCartOpen: false,
};

class Cart {
  #state;
  #observer;

  constructor() {
    // 새로고침해도 데이터 유지시키기
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      // isCartOpen 상태는 새로고침 시 항상 false로 초기화
      this.#state = { ...parsedCart, isCartOpen: false };
    } else {
      this.#state = initialState;
    }
    this.#observer = new Set();
  }

  getState() {
    return structuredClone(this.#state);
  }

  #setState(val) {
    this.#state = { ...this.#state, ...val };
    // 상태가 변경될 때마다 localStorage에 저장
    localStorage.setItem("cart", JSON.stringify(this.#state));
    // 구독자에게 변화 감지 + 리렌더링 함수 실행
    this.#notify();
  }

  #notify() {
    console.log("Cart Store - 데이터 변화 감지!");
    this.#observer.forEach((callback) => callback());
  }

  /**
   * 옵저버 생성 (구독자/컴포넌트 추가)
   * @param {function} callback 옵저버의 리렌더링 함수
   * @return {function} 옵저빙 취소 함수 제공 (옵저버 패턴 해제 로직)
   * */
  subscribe(callback) {
    console.log("Cart Store - subscribe!", callback);
    this.#observer.add(callback);
    return () => this.unsubscribe(callback);
  }

  /**
   * 옵저버 삭제 (구독 취소)
   * @param {function} callback 옵저버의 리렌더링 함수(observer Set데이터에서 삭제)
   * */
  unsubscribe(callback) {
    console.log("Cart Store - unsubscribe!", callback);
    this.#observer.delete(callback);
  }

  /**
   * 장바구니 모달의 열림/닫힘 상태 제어
   * @param {boolean} isOpen - 모달 노출/비노출 상태값
   */
  toggleCartModal(isOpen) {
    this.#setState({ isCartOpen: isOpen });
  }

  /**
   * 장바구니에 상품 등록 및 수량 추가
   * @param {Object} product - 추가할 상품 객체 { id, name, imageUrl, price }
   * @param {number} quantity - 추가할 수량
   */
  addItem(product, quantity = 1) {
    const existingItemIndex = this.#state.items.findIndex((item) => item.productId === product.productId);
    let updatedItems;

    if (existingItemIndex > -1) {
      updatedItems = [...this.#state.items];
      updatedItems[existingItemIndex].quantity += quantity;
      console.log("Cart Store - 기존 장바구니 상품의 갯수 추가!", updatedItems);
    } else {
      const newItem = { ...product, quantity, isChecked: true };
      updatedItems = [...this.#state.items, newItem];
      console.log("Cart Store - 신규 장바구니 상품 추가!", updatedItems);
    }
    this.#setState({ items: updatedItems });
  }

  /**
   * 장바구니에 등록된 상품 제거
   * @param {string} productId - 제거할 상품의 ID
   */
  removeItem(productId) {
    const updatedItems = this.#state.items.filter((item) => item.productId !== productId);
    this.#setState({ items: updatedItems });
  }

  /**
   * 장바구니 상품 수량 업데이트
   * @param {string} productId - 상품 ID
   * @param {number} newQuantity - 새로운 수량
   */
  updateItemQuantity(productId, newQuantity) {
    const updatedItems = this.#state.items.map((item) =>
      item.productId === productId ? { ...item, quantity: Math.max(1, newQuantity) } : item,
    );
    this.#setState({ items: updatedItems });
  }

  /**
   * 장바구니 상품 선택/해제 - 개별
   * @param {string} productId - 상품 ID
   */
  cartItemChecked(productId) {
    const updatedItems = this.#state.items.map((item) =>
      item.productId === productId ? { ...item, isChecked: !item.isChecked } : item,
    );
    this.#setState({ items: updatedItems });
  }

  /**
   * 장바구니 상품 선택/해제 - 전체
   * @param {boolean} isChecked - 전체 선택 여부
   */
  cartAllItemsChecked(isChecked) {
    const updatedItems = this.#state.items.map((item) => ({ ...item, isChecked }));
    this.#setState({ items: updatedItems });
  }

  /**
   * 선택된 상품들 제거
   */
  removeSelectedItems() {
    const updatedItems = this.#state.items.filter((item) => !item.isChecked);
    this.#setState({ items: updatedItems });
  }

  /**
   * 장바구니 비우기
   */
  clearCart() {
    console.log("clearCart", this.#state.isCartOpen);
    this.#setState({ ...initialState, isCartOpen: this.#state.isCartOpen });
  }

  /**
   * 장바구니에 등록된 총 상품 금액 계산
   * @returns {number} 총 금액
   */
  getTotalPrice() {
    return this.#state.items.reduce((total, item) => total + item.lprice * item.quantity, 0);
  }

  /**
   * 선택된 상품들의 총 금액 계산
   * @returns {number} 선택된 상품들의 총 금액
   */
  getSelectedTotalPrice() {
    return this.#state.items.reduce((total, item) => (item.isChecked ? total + item.lprice * item.quantity : total), 0);
  }

  /**
   * 선택된 상품의 개수 반환
   * @returns {number} 선택된 상품의 개수
   */
  getSelectedItemsCount() {
    return this.#state.items.filter((item) => item.isChecked).length;
  }
}

export const cartStore = new Cart();
