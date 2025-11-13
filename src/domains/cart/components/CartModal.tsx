import { sum } from "es-toolkit";
import { useLocalStorage } from "../../../shared/hooks/useLocalStorage";
import { Cart } from "../types";
import { useMemo } from "@core/state/useMemo";
import { useState } from "@core/state/useState";
import { showToast } from "../../../shared/components/Toast";

type CartModalProps = {
  onClose: () => void;
};

export function CartModal({ onClose }: CartModalProps) {
  const [cart, setCart] = useLocalStorage<Cart[]>("cart", []);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const totalQuantity = useMemo(
    () => sum(cart.map((item) => item.quantity)),
    [cart],
  );
  const totalPrice = useMemo(
    () => sum(cart.map((item) => Number(item.product.lprice) * item.quantity)),
    [cart],
  );

  return (
    <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="relative bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"
              ></path>
            </svg>
            장바구니
            <span className="text-sm font-normal text-gray-600 ml-1">
              ({totalQuantity})
            </span>
          </h2>
          <button
            id="cart-modal-close-btn"
            className="text-gray-400 hover:text-gray-600 p-1"
            onClick={onClose}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                장바구니가 비어있습니다
              </h3>
              <p className="text-gray-600">원하는 상품을 담아보세요!</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col max-h-[calc(90vh-120px)]">
            {/* 전체 선택 섹션 */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  id="cart-modal-select-all-checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                  checked={selectedItems.length === cart.length}
                  onChange={(e) => {
                    if (e.currentTarget?.checked) {
                      setSelectedItems(
                        cart.map((item) => item.product.productId),
                      );
                    } else {
                      setSelectedItems([]);
                    }
                  }}
                />
                전체선택 ({totalQuantity}개)
              </label>
            </div>
            {/* 아이템 목록 */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {cart.map((item) => (
                  <div
                    className="flex items-center py-3 border-b border-gray-100 cart-item"
                    data-product-id="85067212996"
                  >
                    {/* 선택 체크박스 */}
                    <label className="flex items-center mr-3">
                      <input
                        type="checkbox"
                        className="cart-item-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded 
                focus:ring-blue-500"
                        data-product-id="85067212996"
                        checked={selectedItems.includes(item.product.productId)}
                        onChange={(e) => {
                          if (e.currentTarget?.checked) {
                            setSelectedItems([
                              ...selectedItems,
                              item.product.productId,
                            ]);
                          } else {
                            setSelectedItems(
                              selectedItems.filter(
                                (id) => id !== item.product.productId,
                              ),
                            );
                          }
                        }}
                      />
                    </label>
                    {/* 상품 이미지 */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-full h-full object-cover cursor-pointer cart-item-image"
                        data-product-id="85067212996"
                      />
                    </div>
                    {/* 상품 정보 */}
                    <div className="flex-1 min-w-0">
                      <h4
                        className="text-sm font-medium text-gray-900 truncate cursor-pointer cart-item-title"
                        data-product-id="85067212996"
                      >
                        {item.product.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.product.lprice}원
                      </p>
                      {/* 수량 조절 */}
                      <div className="flex items-center mt-2">
                        <button
                          className="quantity-decrease-btn w-7 h-7 flex items-center justify-center 
                 border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100"
                          data-product-id="85067212996"
                          onClick={() => {
                            setCart(
                              cart.map((campareItem) =>
                                campareItem.product.productId ===
                                item.product.productId
                                  ? {
                                      ...campareItem,
                                      quantity: Math.max(
                                        campareItem.quantity - 1,
                                        1,
                                      ),
                                    }
                                  : campareItem,
                              ),
                            );
                          }}
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M20 12H4"
                            ></path>
                          </svg>
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          min="1"
                          className="quantity-input w-12 h-7 text-center text-sm border-t border-b 
                border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          disabled
                          data-product-id="85067212996"
                        />
                        <button
                          className="quantity-increase-btn w-7 h-7 flex items-center justify-center 
                 border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
                          data-product-id="85067212996"
                          onClick={() => {
                            setCart(
                              cart.map((campareItem) =>
                                campareItem.product.productId ===
                                item.product.productId
                                  ? {
                                      ...campareItem,
                                      quantity: campareItem.quantity + 1,
                                    }
                                  : campareItem,
                              ),
                            );
                          }}
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 4v16m8-8H4"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    {/* 가격 및 삭제 */}
                    <div className="text-right ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {Number(item.product.lprice) * item.quantity}원
                      </p>
                      <button
                        className="cart-item-remove-btn mt-1 text-xs text-red-600 hover:text-red-800"
                        data-product-id="85067212996"
                        onClick={() => {
                          setCart(
                            cart.filter(
                              (campareItem) =>
                                campareItem.product.productId !==
                                item.product.productId,
                            ),
                          );
                          showToast("info", "선택된 상품들이 삭제되었습니다");
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* 하단 액션 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          {/* 선택된 아이템 정보 */}
          {/* 총 금액 */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold text-gray-900">총 금액</span>
            <span className="text-xl font-bold text-blue-600">
              {totalPrice}원
            </span>
          </div>
          {/* 액션 버튼들 */}
          <div className="space-y-2">
            {selectedItems.length > 0 && (
              <button
                id="cart-modal-remove-selected-btn"
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md 
                       hover:bg-red-700 transition-colors text-sm"
                onClick={() => {
                  setCart(
                    cart.filter(
                      (item) => !selectedItems.includes(item.product.productId),
                    ),
                  );
                  setSelectedItems([]);
                  showToast("info", "선택된 상품들이 삭제되었습니다");
                }}
              >
                선택한 상품 삭제 ({selectedItems.length}개)
              </button>
            )}
            <div className="flex gap-2">
              <button
                id="cart-modal-clear-cart-btn"
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md 
                       hover:bg-gray-700 transition-colors text-sm"
                onClick={() => {
                  setCart([]);
                  setSelectedItems([]);
                  showToast("info", "선택된 상품들이 삭제되었습니다");
                }}
              >
                전체 비우기
              </button>
              <button
                id="cart-modal-checkout-btn"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md 
                       hover:bg-blue-700 transition-colors text-sm"
              >
                구매하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
