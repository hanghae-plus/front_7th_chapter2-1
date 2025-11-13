import { Component } from "@/core/Component";
import ProductCard from "@/components/product/ProductCard";
import ProductSkeleton from "@/components/product/ProductSkeleton";
import Loading from "@/components/common/Loading";

// 에러 템플릿 (부분 영역 - 재시도 버튼)
const ErrorTemplate = ({ message, onRetry }) => {
  // 재시도 버튼에 이벤트 리스너 등록
  setTimeout(() => {
    const retryBtn = document.querySelector("#product-list-retry-btn");
    if (retryBtn && onRetry) {
      retryBtn.addEventListener("click", onRetry);
    }
  }, 0);

  return /* HTML */ `
    <div class="flex flex-col items-center justify-center py-12 px-4">
      <!-- 에러 아이콘 -->
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <!-- 에러 메시지 -->
      <h3 class="text-lg font-semibold text-gray-900 mb-2">문제가 발생했습니다</h3>
      <p class="text-sm text-gray-600 text-center mb-6">${message}</p>

      <!-- 재시도 버튼 -->
      ${onRetry
        ? /* HTML */ `
            <button
              id="product-list-retry-btn"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          `
        : ""}
    </div>
  `;
};

const ProductList = Component({
  template: (context) => {
    const { products, pagination, loading, loadingMore, hasNext, error, onRetry } = context.props;

    // 에러 상태
    if (error && !loadingMore) {
      return ErrorTemplate({ message: error, onRetry });
    }

    // 초기 로딩 상태
    if (loading) {
      return /* HTML */ ` <div class="grid grid-cols-2 gap-4 mb-6">${ProductSkeleton().repeat(4)}</div> `;
    }

    // 정상 렌더링
    return /* HTML */ `
      <div>
        ${products?.length
          ? /* HTML */ `
              <div class="mb-4 text-sm text-gray-600">
                총 <span class="font-medium text-gray-900">${Number(pagination?.total).toLocaleString()}개</span>의 상품
              </div>
            `
          : ""}

        <!-- 상품 그리드 -->
        <div class="grid grid-cols-2 gap-4 mb-6" id="products-grid">
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
          ${loadingMore ? ProductSkeleton().repeat(4) : ""}
        </div>

        <!-- IntersectionObserver 타겟 -->
        ${hasNext && !loading ? /* HTML */ `<div id="infinite-scroll-trigger" class="h-10"></div>` : ""}

        <!-- 로딩 인디케이터 -->
        ${loadingMore ? Loading({ message: "상품을 불러오는 중..." }) : ""}

        <!-- 더 이상 데이터 없음 -->
        ${!hasNext && products.length > 0
          ? /* HTML */ `<div class="text-center py-4 text-gray-500 text-sm">모든 상품을 불러왔습니다.</div>`
          : ""}
      </div>
    `;
  },
  children: (context) => {
    const { products, error } = context.props;

    // 에러 상태에서는 자식 컴포넌트 마운트하지 않음
    if (error) return;

    products?.forEach((product) => {
      context.mountChildren(ProductCard, `[data-product-id="${product.productId}"]`, { product });
    });
  },

  setup: (context) => {
    const { props } = context;
    const { onLoadMore, hasNext, loadingMore, loading, error } = props;

    // 에러, 초기 로딩, 추가 로딩 중이거나 무한 스크롤 조건이 맞지 않으면 옵저버 설정 안 함
    if (error || loading || loadingMore || !onLoadMore || !hasNext) return;

    // IntersectionObserver 설정
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasNext && !loadingMore && !loading) {
            onLoadMore();
          }
        });
      },
      {
        root: null,
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    // 타겟 요소 관찰 시작
    const target = document.getElementById("infinite-scroll-trigger");
    if (target) {
      observer.observe(target);
    }

    // cleanup 함수 반환
    return () => {
      if (target) {
        observer.unobserve(target);
      }
      observer.disconnect();
    };
  },
});

export default ProductList;
