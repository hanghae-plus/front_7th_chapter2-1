class CartStore {
  constructor() {
    this.state = {
      items: [], // 장바구니 아이템
      selectedItems: [], // 선택된 아이템 ID
    };
    this.listeners = new Set();
    
    // localStorage에서 장바구니 복원
    this.loadFromStorage();
  }

  /**
   * 상태 가져오기
   */
  getState() {
    return this.state;
  }

  /**
   * 상태 업데이트 및 리스너 호출
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
    this.saveToStorage();
  }

  /**
   * 리스너 등록 (상태 변경 구독)
   */
  subscribe(listener) {
    this.listeners.add(listener);
    
    // 구독 해제 함수 반환
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 모든 리스너에게 알림
   */
  notify() {
    this.listeners.forEach(listener => {
      listener(this.state);
    });
  }

  /**
   * localStorage에서 불러오기
   */
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('shopping_cart');
      if (saved) {
        const data = JSON.parse(saved);
        this.state.items = data.items || [];
        this.state.selectedItems = data.selectedItems || [];
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error);
    }
  }

  /**
   * localStorage에 저장
   */
  saveToStorage() {
    try {
      localStorage.setItem('shopping_cart', JSON.stringify({
        items: this.state.items,
        selectedItems: this.state.selectedItems,
      }));
    } catch (error) {
      console.error('Failed to save cart to storage:', error);
    }
  }

  // ========== 장바구니 액션들 ==========

  /**
   * 장바구니에 상품 추가
   */
  addItem(product) {
    const existingIndex = this.state.items.findIndex(
      item => item.productId === product.productId
    );

    if (existingIndex !== -1) {
      // 이미 있으면 수량 증가
      const newItems = [...this.state.items];
      newItems[existingIndex].quantity += 1;
      this.setState({ items: newItems });
    } else {
      // 없으면 새로 추가
      this.setState({
        items: [...this.state.items, { ...product, quantity: 1 }]
      });
    }
  }

  /**
   * 장바구니에서 상품 제거
   */
  removeItem(productId) {
    this.setState({
      items: this.state.items.filter(item => item.productId !== productId),
      selectedItems: this.state.selectedItems.filter(id => id !== productId)
    });
  }

  /**
   * 상품 수량 변경
   */
  updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const newItems = this.state.items.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    );
    this.setState({ items: newItems });
  }

  /**
   * 상품 수량 증가
   */
  increaseQuantity(productId) {
    const item = this.state.items.find(item => item.productId === productId);
    if (item) {
      this.updateQuantity(productId, item.quantity + 1);
    }
  }

  /**
   * 상품 수량 감소
   * 수량이 1일 때는 더 줄어들지 않음
   */
  decreaseQuantity(productId) {
    const item = this.state.items.find(item => item.productId === productId);
    if (item) {
      // 수량이 1이면 더 줄어들지 않음
      if (item.quantity <= 1) {
        return;
      }
      this.updateQuantity(productId, item.quantity - 1);
    }
  }

  /**
   * 상품 선택/해제 토글
   */
  toggleSelect(productId) {
    const isSelected = this.state.selectedItems.includes(productId);
    
    if (isSelected) {
      this.setState({
        selectedItems: this.state.selectedItems.filter(id => id !== productId)
      });
    } else {
      this.setState({
        selectedItems: [...this.state.selectedItems, productId]
      });
    }
  }

  /**
   * 전체 선택/해제
   */
  toggleSelectAll() {
    if (this.state.selectedItems.length === this.state.items.length) {
      // 전체 해제
      this.setState({ selectedItems: [] });
    } else {
      // 전체 선택
      this.setState({
        selectedItems: this.state.items.map(item => item.productId)
      });
    }
  }

  /**
   * 선택된 상품 삭제
   */
  removeSelected() {
    this.setState({
      items: this.state.items.filter(
        item => !this.state.selectedItems.includes(item.productId)
      ),
      selectedItems: []
    });
  }

  /**
   * 장바구니 전체 비우기
   */
  clearCart() {
    this.setState({
      items: [],
      selectedItems: []
    });
  }


  /**
   * 총 금액 계산
   */
  getTotalAmount() {
    return this.state.items.reduce((sum, item) => {
      return sum + (item.lprice * item.quantity);
    }, 0);
  }

  /**
   * 선택된 상품 금액 계산
   */
  getSelectedAmount() {
    return this.state.items
      .filter(item => this.state.selectedItems.includes(item.productId))
      .reduce((sum, item) => {
        return sum + (item.lprice * item.quantity);
      }, 0);
  }

  /**
   * 총 상품 개수 (아이템 종류 수)
   */
  getTotalCount() {
    return this.state.items.length;
  }

  /**
   * 총 수량 (모든 상품의 수량 합계)
   */
  getTotalQuantity() {
    return this.state.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}

// 싱글톤 인스턴스
export const cartStore = new CartStore();

// 개발 환경에서 디버깅
if (import.meta.env.DEV) {
  window.cartStore = cartStore;
  cartStore.subscribe((state) => {
    console.log('[CartStore] State changed:', state);
  });
}

