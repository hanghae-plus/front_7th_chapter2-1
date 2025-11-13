import { Product } from "../../types";
import { ProductItem } from "./ProductItem";
import { ProductSkeleton } from "./ProductSkeleton";
import { SpinCircle } from "./SpinCircle";

type ProductListProps = {
  totalProducts: number;
  products: Product[];
  isLoading: boolean;
  limit: number;
};

export function ProductList({
  totalProducts,
  products,
  isLoading,
  limit,
}: ProductListProps) {
  return (
    <div className="mb-6">
      <div>
        {/* 상품 개수 정보 */}
        <div className="mb-4 text-sm text-gray-600">
          총{" "}
          <span className="font-medium text-gray-900">{totalProducts}개</span>의
          상품
        </div>
        {/* 상품 그리드 */}
        <div className="grid grid-cols-2 gap-4 mb-6" id="products-grid">
          {(() => {
            if (isLoading) {
              return Array.from({ length: limit }).map(() => (
                <ProductSkeleton />
              ));
            }

            return products.map((product) => <ProductItem product={product} />);
          })()}
        </div>

        {(() => {
          if (isLoading) {
            return (
              <div className="text-center py-4">
                <div className="inline-flex items-center">
                  <SpinCircle />
                  <span className="text-sm text-gray-600">
                    상품을 불러오는 중...
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div className="text-center py-4 text-sm text-gray-500">
              모든 상품을 확인했습니다
            </div>
          );
        })()}
      </div>
    </div>
  );
}
