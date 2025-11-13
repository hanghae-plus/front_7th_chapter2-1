import { Component } from "@/core/Component";
import ProductCard from "@/components/product/ProductCard";

const Loading = () => {
  return /* HTML */ `
    <div class="text-center py-4">
      <div class="inline-flex items-center">
        <svg class="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span class="text-sm text-gray-600">상품을 불러오는 중...</span>
      </div>
    </div>
  `;
};

const Skelleton = () => {
  return /* HTML */ `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div class="aspect-square bg-gray-200"></div>
      <div class="p-3">
        <div class="h-4 bg-gray-200 rounded mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div class="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div class="h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  `;
};

const ProductList = Component({
  template: (context) => {
    const { products, pagination, loading, loadingMore, hasNext } = context.props;
    return /* HTML */ `
      <div>
        ${products?.length && !loading
          ? /* HTML */ ` <div class="mb-4 text-sm text-gray-600">
              총 <span class="font-medium text-gray-900">${Number(pagination?.total).toLocaleString()}개</span>의 상품
            </div>`
          : ""}
        <!-- 상품 그리드 -->
        <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
          <!-- 초기 로딩 스켈레톤 -->
          ${loading ? Skelleton().repeat(4) : ""}
          <!-- 상품 카드 -->
          ${products
            .map(
              (product) => /* HTML */ `
                <div
                  class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden product-card"
                  data-product-id="${product.productId}"
                ></div>
              `,
            )
            .join("")}
          <!-- 추가 로딩 스켈레톤 -->
          ${loadingMore ? Skelleton().repeat(4) : ""}
        </div>
        <!-- IntersectionObserver 타겟 -->
        ${hasNext && !loading ? /* HTML */ `<div id="infinite-scroll-trigger" class="h-10"></div>` : ""}
        <!-- 로딩 인디케이터 -->
        ${loadingMore ? Loading() : ""}
        <!-- 더 이상 데이터 없음 -->
        ${!hasNext && !loading && products.length > 0
          ? /* HTML */ `<div class="text-center py-4 text-gray-500 text-sm">모든 상품을 불러왔습니다.</div>`
          : ""}
      </div>
    `;
  },
  children: (context) => {
    const { products } = context.props;
    products.forEach((product) => {
      context.mountChildren(ProductCard, `[data-product-id="${product.productId}"]`, { product });
    });
  },
  setup: (context) => {
    const { props } = context;
    const { onLoadMore, hasNext, loadingMore } = props;

    if (!onLoadMore || !hasNext || loadingMore) return;

    // IntersectionObserver 설정
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasNext && !loadingMore) {
          onLoadMore();
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    });

    // 타겟 요소 관찰 시작
    const target = document.getElementById("infinite-scroll-trigger");
    if (target) {
      observer.observe(target);
    }

    // cleanup 함수 반환 (컴포넌트 언마운트 시 실행)
    return () => {
      if (target) {
        observer.unobserve(target);
      }
      observer.disconnect();
    };
  },
});

export default ProductList;
