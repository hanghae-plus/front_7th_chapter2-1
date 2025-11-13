/* eslint-disable max-len */

import { isNotNil } from "es-toolkit";
import { useLocalStorage } from "../../../../shared/hooks/useLocalStorage";
import { Cart } from "../../../cart/types";
import { Product } from "../../types";
import { showToast } from "../../../../shared/components/Toast";
import { Link } from "@core/components/Link";

type ProductItemProps = {
  product: Product;
};

export function ProductItem({ product }: ProductItemProps) {
  const [_, setCart] = useLocalStorage<Cart[]>("cart", []);

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card"
      data-product-id={product.productId}
    >
      {/* 상품 이미지 */}
      <Link to="상품 상세" pathParams={{ id: product.productId }}>
        <div className="aspect-square bg-gray-100 overflow-hidden cursor-pointer product-image">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        </div>
      </Link>
      {/* 상품 정보 */}
      <div className="p-3">
        <Link to="상품 상세" pathParams={{ id: product.productId }}>
          <div className="cursor-pointer product-info mb-3">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
              {product.title}
            </h3>
            <p className="text-xs text-gray-500 mb-2">{product.mallName}</p>
            <p className="text-lg font-bold text-gray-900">
              {product.lprice}원
            </p>
          </div>
        </Link>
        {/* 장바구니 버튼 */}
        <button
          className="w-full bg-blue-600 text-white text-sm py-2 px-3 rounded-md hover:bg-blue-700 transition-colors add-to-cart-btn"
          data-product-id={product.productId}
          onClick={() => {
            setCart((prev) => {
              const existingCart = prev.find(
                (cart) => cart.product.productId === product.productId,
              );
              if (isNotNil(existingCart)) {
                return prev.map((cart) =>
                  cart.product.productId === product.productId
                    ? { ...cart, quantity: cart.quantity + 1 }
                    : cart,
                );
              }
              return [...prev, { product, quantity: 1 }];
            });
            showToast("success", "장바구니에 추가되었습니다");
          }}
        >
          장바구니 담기
        </button>
      </div>
    </div>
  );
}
