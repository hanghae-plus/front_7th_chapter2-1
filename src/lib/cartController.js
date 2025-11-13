import { CART_BADGE_CLASSES, CART_SELECTION_STORAGE_KEY, CART_STORAGE_KEY } from "./constants.js";
import { renderCartModal } from "../components/index.js";
import * as cartActions from "../store/actions/cartActions.js";

export function loadCartFromStorage() {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    const uniqueItems = new Map();
    parsedValue.forEach((item) => {
      if (!item || typeof item.productId !== "string") {
        return;
      }

      const resolvedQuantity = (() => {
        const raw = Number.parseInt(item.quantity ?? item.qty ?? 1, 10);
        return Number.isNaN(raw) || raw < 1 ? 1 : raw;
      })();

      const stored = uniqueItems.get(item.productId);
      if (stored) {
        stored.quantity += resolvedQuantity;
        return;
      }

      uniqueItems.set(item.productId, {
        productId: item.productId,
        title: item.title ?? "",
        price: item.price ?? item.lprice ?? "",
        image: item.image ?? "",
        brand: item.brand ?? "",
        quantity: resolvedQuantity,
      });
    });

    return Array.from(uniqueItems.values());
  } catch (error) {
    console.error("장바구니 정보를 불러오는 중 오류가 발생했습니다.", error);
    return [];
  }
}

export function saveCartToStorage() {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.store.state.cart.items));
  } catch (error) {
    console.error("장바구니 정보를 저장하는 중 오류가 발생했습니다.", error);
  }
}

export function loadCartSelectionFromStorage() {
  if (typeof window === "undefined" || !window.localStorage) {
    return new Set();
  }

  try {
    const storedValue = window.localStorage.getItem(CART_SELECTION_STORAGE_KEY);
    if (!storedValue) {
      return new Set();
    }

    const parsedValue = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) {
      return new Set();
    }

    const sanitized = parsedValue
      .map((value) => {
        if (value === null || value === undefined) {
          return "";
        }
        return String(value);
      })
      .filter((value) => value.length > 0);
    return new Set(sanitized);
  } catch (error) {
    console.error("선택한 장바구니 정보를 불러오는 중 오류가 발생했습니다.", error);
    return new Set();
  }
}

export function saveCartSelectionToStorage() {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  try {
    const selectedIds = Array.from(this.ensureSelectedIdsSet());
    if (selectedIds.length === 0) {
      window.localStorage.removeItem(CART_SELECTION_STORAGE_KEY);
    } else {
      window.localStorage.setItem(CART_SELECTION_STORAGE_KEY, JSON.stringify(selectedIds));
    }
  } catch (error) {
    console.error("선택한 장바구니 정보를 저장하는 중 오류가 발생했습니다.", error);
  }
}

export function ensureSelectedIdsSet() {
  // Store에서 항상 Set으로 관리되므로 검증만 수행
  const selectedIds = this.store.state.cart.selectedIds;
  if (!(selectedIds instanceof Set)) {
    console.warn("selectedIds is not a Set, initializing to empty Set");
    cartActions.setCartSelection(this.store, new Set());
    return this.store.state.cart.selectedIds;
  }
  return selectedIds;
}

export function areSetsEqual(setA, setB) {
  if (!(setA instanceof Set) || !(setB instanceof Set)) {
    return false;
  }

  if (setA.size !== setB.size) {
    return false;
  }

  for (const value of setA) {
    if (!setB.has(value)) {
      return false;
    }
  }

  return true;
}

export function setSelectedIds(nextIds) {
  const normalizedInput = nextIds instanceof Set ? nextIds : new Set(nextIds ?? []);
  const sanitized = new Set();
  normalizedInput.forEach((value) => {
    if (value === null || value === undefined) {
      return;
    }
    const stringValue = typeof value === "string" ? value : String(value);
    if (stringValue.length > 0) {
      sanitized.add(stringValue);
    }
  });

  const currentSelections = this.ensureSelectedIdsSet();
  const hasChanged = !this.areSetsEqual(currentSelections, sanitized);

  cartActions.setCartSelection(this.store, sanitized);

  if (hasChanged) {
    this.saveCartSelectionToStorage();
  }
}

export function getCartCount() {
  // 장바구니에 담긴 상품의 종류 수 반환 (전체 개수가 아님)
  return this.store.state.cart.items.length;
}

export function updateCartIcon() {
  if (typeof document === "undefined") {
    return;
  }

  const cartButton = document.getElementById("cart-icon-btn");
  if (!cartButton) {
    return;
  }

  let badge = cartButton.querySelector("span");
  const count = this.getCartCount();

  if (count > 0) {
    if (!badge) {
      badge = document.createElement("span");
      badge.className = CART_BADGE_CLASSES;
      cartButton.appendChild(badge);
    }
    badge.textContent = String(count);
    badge.style.display = "flex";
  } else if (badge) {
    badge.remove();
  }
}

export function openCartModal() {
  if (typeof document === "undefined") {
    return;
  }

  const modalElement = this.store.state.cart.modalElement;
  if (modalElement) {
    this.closeCartModal(false);
  }

  this.ensureSelectedIdsSet();
  const lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const overlay = document.createElement("div");
  overlay.className =
    "cart-modal-overlay fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center px-0 sm:px-4";
  overlay.setAttribute("role", "presentation");
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      event.stopPropagation();
      requestAnimationFrame(() => {
        this.closeCartModal();
      });
    }
  });

  const escListener = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      this.closeCartModal();
    }
  };
  document.addEventListener("keydown", escListener);

  // Actions를 통한 상태 업데이트
  cartActions.openCartModal(this.store, overlay, lastFocusedElement, escListener);

  this.updateCartModalView();
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  // 모달이 열릴 때 메인 콘텐츠를 스크린 리더에서 숨김
  const root = document.getElementById("root");
  if (root) {
    root.setAttribute("aria-hidden", "true");
  }
}

export function closeCartModal(restoreFocus = true) {
  const modalElement = this.store.state.cart.modalElement;
  if (!modalElement) {
    return;
  }

  const escListener = this.store.state.cart.escListener;
  if (escListener) {
    document.removeEventListener("keydown", escListener);
  }

  modalElement.remove();
  document.body.style.overflow = "";

  // 모달이 닫힐 때 메인 콘텐츠를 다시 보이게 함
  const root = document.getElementById("root");
  if (root) {
    root.removeAttribute("aria-hidden");
  }

  const lastFocusedElement = this.store.state.cart.lastFocusedElement;

  // Actions를 통한 상태 업데이트
  cartActions.closeCartModal(this.store);

  this.saveCartSelectionToStorage();

  if (restoreFocus && lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

export function updateCartModalView() {
  const modalElement = this.store.state.cart.modalElement;
  const isOpen = this.store.state.cart.isOpen;

  if (!modalElement || !isOpen) {
    return;
  }

  this.normalizeCartSelections();
  const selectedIds = this.ensureSelectedIdsSet();
  const totals = this.calculateCartTotals();

  const items = this.store.state.cart.items.map((item) => {
    const quantity = this.getCartItemQuantity(item);
    return {
      productId: item.productId,
      title: item.title ?? "",
      image: item.image ?? "",
      brand: item.brand ?? "",
      quantity,
      unitPrice: this.getCartItemUnitPrice(item),
      isSelected: selectedIds.has(item.productId),
    };
  });

  const summary = {
    itemCount: items.length,
    selectedCount: totals.selectedCount,
    selectedPrice: totals.selectedPrice,
    totalPrice: totals.totalPrice,
    allSelected: items.length > 0 && selectedIds.size === items.length,
  };

  modalElement.innerHTML = renderCartModal({ items, summary });
  this.attachCartModalEventHandlers();
}

export function normalizeCartSelections() {
  const currentSelections = this.ensureSelectedIdsSet();
  const validSelections = new Set();
  this.store.state.cart.items.forEach((item) => {
    if (currentSelections.has(item.productId)) {
      validSelections.add(item.productId);
    }
  });
  this.setSelectedIds(validSelections);
}

export function attachCartModalEventHandlers() {
  const modalElement = this.store.state.cart.modalElement;
  if (!modalElement) {
    return;
  }

  const overlay = modalElement;

  const closeButton = overlay.querySelector("#cart-modal-close-btn");
  if (closeButton) {
    closeButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.closeCartModal();
    });
  }

  const selectAllCheckbox = overlay.querySelector("#cart-modal-select-all-checkbox");
  if (selectAllCheckbox instanceof HTMLInputElement) {
    const totalCount = this.store.state.cart.items.length;
    const currentSelected = this.ensureSelectedIdsSet();
    const selectedCount = currentSelected.size;
    selectAllCheckbox.checked = totalCount > 0 && selectedCount === totalCount;
    selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < totalCount;

    selectAllCheckbox.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) {
        return;
      }

      if (target.checked) {
        this.setSelectedIds(new Set(this.store.state.cart.items.map((item) => item.productId)));
      } else {
        this.setSelectedIds(new Set());
      }

      this.updateCartModalView();
    });
  }

  overlay.querySelectorAll(".cart-item-checkbox").forEach((element) => {
    element.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) {
        return;
      }

      const productId = target.dataset.productId ?? "";
      if (!productId) {
        return;
      }

      const currentSelected = this.ensureSelectedIdsSet();
      const nextSelected = new Set(currentSelected);
      if (target.checked) {
        nextSelected.add(productId);
      } else {
        nextSelected.delete(productId);
      }
      this.setSelectedIds(nextSelected);
      this.updateCartModalView();
    });
  });

  overlay.querySelectorAll(".quantity-increase-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const productId = button.dataset.productId ?? "";
      if (productId) {
        this.changeCartItemQuantity(productId, 1);
      }
    });
  });

  overlay.querySelectorAll(".quantity-decrease-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const productId = button.dataset.productId ?? "";
      if (productId) {
        this.changeCartItemQuantity(productId, -1);
      }
    });
  });

  overlay.querySelectorAll(".cart-item-remove-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const productId = button.dataset.productId ?? "";
      if (productId) {
        this.removeCartItem(productId);
      }
    });
  });

  const removeSelectedButton = overlay.querySelector("#cart-modal-remove-selected-btn");
  if (removeSelectedButton) {
    removeSelectedButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.removeSelectedCartItems();
    });
  }

  const clearCartButton = overlay.querySelector("#cart-modal-clear-cart-btn");
  if (clearCartButton) {
    clearCartButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.clearCartItems();
    });
  }

  const checkoutButton = overlay.querySelector("#cart-modal-checkout-btn");
  if (checkoutButton) {
    checkoutButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.showToast("구매 기능은 준비 중입니다", "info");
    });
  }
}

export function changeCartItemQuantity(productId, delta) {
  if (!delta) {
    return;
  }

  const item = this.store.state.cart.items.find((item) => item.productId === productId);
  if (!item) {
    return;
  }

  const currentQuantity = this.getCartItemQuantity(item);
  const nextQuantity = currentQuantity + delta;
  const finalQuantity = nextQuantity < 1 ? 1 : nextQuantity;

  if (finalQuantity === currentQuantity) {
    return;
  }

  cartActions.updateCartItemQuantity(this.store, productId, finalQuantity);

  this.saveCartToStorage();
  this.updateCartIcon();
  this.updateCartModalView();
}

export function removeCartItem(productId) {
  const initialLength = this.store.state.cart.items.length;

  if (initialLength === 0) {
    return;
  }

  cartActions.removeCartItem(this.store, productId);

  if (this.store.state.cart.items.length === initialLength) {
    return;
  }

  this.saveCartToStorage();
  this.updateCartIcon();
  this.updateCartModalView();
  this.showToast("상품을 장바구니에서 삭제했습니다", "info");
}

export function removeSelectedCartItems() {
  const currentSelected = this.ensureSelectedIdsSet();
  if (currentSelected.size === 0) {
    return;
  }

  const initialLength = this.store.state.cart.items.length;

  cartActions.removeSelectedCartItems(this.store);

  if (this.store.state.cart.items.length === initialLength) {
    return;
  }

  this.saveCartToStorage();
  this.updateCartIcon();
  this.updateCartModalView();
  this.showToast("선택한 상품을 삭제했습니다", "info");
}

export function clearCartItems() {
  if (!this.store.state.cart.items.length) {
    return;
  }

  cartActions.clearCart(this.store);

  this.saveCartToStorage();
  this.updateCartIcon();
  this.updateCartModalView();
  this.showToast("장바구니를 모두 비웠습니다", "info");
}

export function calculateCartTotals() {
  let totalPrice = 0;
  let selectedPrice = 0;
  const selectedIds = this.ensureSelectedIdsSet();

  this.store.state.cart.items.forEach((item) => {
    const unitPrice = this.getCartItemUnitPrice(item);
    const quantity = this.getCartItemQuantity(item);
    const lineTotal = unitPrice * quantity;
    totalPrice += lineTotal;

    if (selectedIds.has(item.productId)) {
      selectedPrice += lineTotal;
    }
  });

  return {
    totalPrice,
    selectedPrice,
    selectedCount: selectedIds.size,
  };
}

export function getCartItemUnitPrice(item) {
  const raw = Number.parseInt(item.price ?? item.lprice ?? "0", 10);
  return Number.isNaN(raw) || raw < 0 ? 0 : raw;
}

export function getCartItemQuantity(item) {
  const raw = Number.parseInt(item.quantity ?? 1, 10);
  return Number.isNaN(raw) || raw < 1 ? 1 : raw;
}
