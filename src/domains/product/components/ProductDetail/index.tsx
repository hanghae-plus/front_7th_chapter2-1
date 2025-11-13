import { isNil, isNotNil, range } from "es-toolkit";
import { Product, ProductDetailResponse } from "../../../../types";
import { getProduct, getProducts } from "../../../../api/productApi";
import { useEffect } from "@core/state/useEffect";
import { useState } from "@core/state/useState";
import { useLocalStorage } from "../../../../shared/hooks/useLocalStorage";
import { Cart } from "../../../cart/types";
import { Link } from "@core/components/Link";

type ProductDetailProps = {
  id: string;
};

export function ProductDetail({ id }: ProductDetailProps) {
  const [product, setProduct] = useState<ProductDetailResponse | null>(null);

  const fetchProduct = async () => {
    const response = await getProduct(id);
    setProduct(response);
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const fetchRelatedProducts = async () => {
    const response = await getProducts({
      category1: product?.category1,
      category2: product?.category2,
      limit: 11,
      page: 1,
    });
    setRelatedProducts(
      response.products
        .filter((product) => product.productId !== id)
        .slice(0, 10),
    );
  };

  useEffect(() => {
    fetchRelatedProducts();
  }, [product?.category1, product?.category2]);

  console.log(product);
  const [quantity, setQuantity] = useState(1);
  const [_, setCart] = useLocalStorage<Cart[]>("cart", []);

  if (isNil(product)) {
    return (
      <main className="max-w-md mx-auto px-4 py-4">
        <div className="py-20 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">상품 정보를 불러오는 중...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 py-4">
      {/* 브레드크럼 */}
      <nav className="mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link
            to="쇼핑몰"
            data-link=""
            className="hover:text-blue-600 transition-colors"
          >
            홈
          </Link>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
          <Link
            to="쇼핑몰"
            queryParams={{ category1: product.category1 }}
            className="breadcrumb-link"
          >
            {product.category1}
          </Link>
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
          <Link
            to="쇼핑몰"
            queryParams={{
              category1: product.category1,
              category2: product.category2,
            }}
            className="breadcrumb-link"
          >
            {product.category2}
          </Link>
        </div>
      </nav>
      {/* 상품 상세 정보 */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        {/* 상품 이미지 */}
        <div className="p-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img
              src={product.images[0]}
              alt="PVC 투명 젤리 쇼핑백 1호 와인 답례품 구디백 비닐 손잡이 미니 간식 선물포장"
              className="w-full h-full object-cover product-detail-image"
            />
          </div>
          {/* 상품 정보 */}
          <div>
            <p className="text-sm text-gray-600 mb-1">{product.mallName}</p>
            <h1 className="text-xl font-bold text-gray-900 mb-3">
              {product.title}
            </h1>
            {/* 평점 및 리뷰 */}
            <div className="flex items-center mb-3">
              <div className="flex items-center">
                {range(5).map((index) =>
                  index < product.rating ? (
                    <svg
                      key={index}
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ),
                )}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {product.rating.toFixed(1)} ({product.reviewCount}개 리뷰)
              </span>
            </div>
            {/* 가격 */}
            <div className="mb-4">
              <span className="text-2xl font-bold text-blue-600">
                {product.lprice}원
              </span>
            </div>
            {/* 재고 */}
            <div className="text-sm text-gray-600 mb-4">
              재고 {product.stock}개
            </div>
            {/* 설명 */}
            <div className="text-sm text-gray-700 leading-relaxed mb-6">
              {product.description}
            </div>
          </div>
        </div>
        {/* 수량 선택 및 액션 */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-900">수량</span>
            <div className="flex items-center">
              <button
                id="quantity-decrease"
                className="w-8 h-8 flex items-center justify-center border border-gray-300 
                   rounded-l-md bg-gray-50 hover:bg-gray-100"
                onClick={() => setQuantity(Math.max(quantity - 1, 1))}
              >
                <svg
                  className="w-4 h-4"
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
                id="quantity-input"
                value={quantity}
                min="1"
                max={product.stock}
                className="w-16 h-8 text-center text-sm border-t border-b border-gray-300 
                  focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                id="quantity-increase"
                className="w-8 h-8 flex items-center justify-center border border-gray-300 
                   rounded-r-md bg-gray-50 hover:bg-gray-100"
                onClick={() =>
                  setQuantity(Math.min(quantity + 1, product.stock))
                }
              >
                <svg
                  className="w-4 h-4"
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
          {/* 액션 버튼 */}
          <button
            id="add-to-cart-btn"
            data-product-id="85067212996"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md 
                 hover:bg-blue-700 transition-colors font-medium"
            onClick={() => {
              setCart((prev) => {
                const existingCart = prev.find(
                  (cart) => cart.product.productId === product.productId,
                );
                if (isNotNil(existingCart)) {
                  return prev.map((cart) =>
                    cart.product.productId === product.productId
                      ? { ...cart, quantity: cart.quantity + quantity }
                      : cart,
                  );
                }

                return [...prev, { product, quantity }];
              });
            }}
          >
            장바구니 담기
          </button>
        </div>
      </div>
      {/* 상품 목록으로 이동 */}
      <div className="mb-6">
        <Link
          to="쇼핑몰"
          className="block w-full text-center bg-gray-100 text-gray-700 py-3 px-4 rounded-md 
            hover:bg-gray-200 transition-colors go-to-product-list"
        >
          상품 목록으로 돌아가기
        </Link>
      </div>
      {/* 관련 상품 */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">관련 상품</h2>
          <p className="text-sm text-gray-600">같은 카테고리의 다른 상품들</p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 responsive-grid">
            {relatedProducts.map((product) => (
              <Link to="상품 상세" pathParams={{ id: product.productId }}>
                <div
                  className="bg-gray-50 rounded-lg p-3 related-product-card cursor-pointer"
                  data-product-id={product.productId}
                >
                  <div className="aspect-square bg-white rounded-md overflow-hidden mb-2">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-sm font-bold text-blue-600">
                    {product.lprice}원
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

const 상세페이지_로딩완료 = (
  <div className="min-h-screen bg-gray-50">
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
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
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
            </button>
            <h1 className="text-lg font-bold text-gray-900">상품 상세</h1>
          </div>
          <div className="flex items-center space-x-2">
            {/* 장바구니 아이콘 */}
            <button
              id="cart-icon-btn"
              className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"
                ></path>
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                1
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <footer className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-md mx-auto py-8 text-center text-gray-500">
        <p>© 2025 항해플러스 프론트엔드 쇼핑몰</p>
      </div>
    </footer>
  </div>
);

const 상세페이지_로딩 = `
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onclick="window.history.back()" className="p-2 text-gray-700 hover:text-gray-900 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <h1 className="text-lg font-bold text-gray-900">상품 상세</h1>
            </div>
            <div className="flex items-center space-x-2">
              {/* 장바구니 아이콘 */}
              <button id="cart-icon-btn" className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 2H3m4 11v6a1 1 0 001 1h1a1 1 0 001-1v-6M13 13v6a1 1 0 001 1h1a1 1 0 001-1v-6"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-4">
        <div className="py-20 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">상품 정보를 불러오는 중...</p>
          </div>
        </div>
      </main>
      <footer className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto py-8 text-center text-gray-500">
          <p>© 2025 항해플러스 프론트엔드 쇼핑몰</p>
        </div>
      </footer>
    </div>
  `;
