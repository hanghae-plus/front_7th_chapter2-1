import { withLifecycle } from "../core/lifecycle.js";
import * as router from "../core/router.js";
import { store } from "../state/store.js";
import { getProducts, getCategories } from "../api/productApi.js";
import { PageLayout } from "./PageLayout.js";
import { SearchForm, ProductList } from "../components/index.js";
import { setupInfiniteScroll, teardownInfiniteScroll } from "../utils/infiniteScroll.js";
import { showToast } from "../utils/toast.js";

// 무한 스크롤 상태
let isLoadingMore = false;
let hasMoreProducts = true;
let scrollObserver = null;

/**
 * 상품 목록 로드
 * 현재 쿼리 파라미터를 읽어서 API 호출
 */
async function loadProducts() {
  const query = router.getCurrentRoute().query;

  // 무한 스크롤 상태 초기화
  hasMoreProducts = true;

  store.dispatch({ type: "pendingProducts" });

  try {
    const data = await getProducts(query);
    store.dispatch({ type: "setProducts", payload: data });

    // 더 불러올 상품이 있는지 확인 (hasNext 사용)
    const { pagination } = data;
    hasMoreProducts = pagination.hasNext || false;
  } catch (error) {
    store.dispatch({ type: "errorProducts", payload: error });
    showToast("상품을 불러올 수 없습니다", "error");
  }
}

/**
 * 다음 페이지 상품 로드 (무한 스크롤)
 */
async function loadMoreProducts() {
  // 에러 상태거나 이미 로딩 중이거나 더 이상 상품이 없으면 중단
  let currentState = store.getState();
  if (currentState.home.error || currentState.home.loading || isLoadingMore || !hasMoreProducts) {
    return;
  }

  isLoadingMore = true;

  // 로딩 상태를 스토어에 반영
  currentState = store.getState();
  store.dispatch({
    type: "setProducts",
    payload: {
      products: currentState.home.products,
      filters: currentState.home.filters,
      pagination: { ...currentState.home.pagination, isLoadingMore: true },
    },
  });

  // 현재 설정된 limit 값 사용 (드롭다운 선택값)
  const limit = currentState.home.pagination.limit || 20;
  const skip = currentState.home.products.length; // 현재까지 로드된 상품 개수

  const query = router.getCurrentRoute().query;
  // query에서 skip과 limit을 제거하고 새로운 값 사용
  // eslint-disable-next-line no-unused-vars
  const { skip: _skip, limit: _limit, ...restQuery } = query;

  try {
    // 계산된 skip과 limit을 사용
    const data = await getProducts({ ...restQuery, skip, limit });
    const { products: newProducts, pagination } = data;

    // 기존 상품에 새 상품 추가
    const allProducts = [...currentState.home.products, ...newProducts];

    store.dispatch({
      type: "setProducts",
      payload: {
        products: allProducts,
        filters: data.filters,
        pagination: { ...pagination, isLoadingMore: false },
      },
    });

    // 더 불러올 상품이 있는지 확인 (hasNext 사용)
    hasMoreProducts = pagination.hasNext || false;
  } catch (error) {
    console.error("Failed to load more products:", error);
    // 무한 스크롤 에러는 전체 에러로 처리하지 않고 로딩 상태만 해제
    // (초기 로딩 실패와 구분)
    const freshState = store.getState();
    store.dispatch({
      type: "setProducts",
      payload: {
        products: freshState.home.products,
        filters: freshState.home.filters,
        pagination: { ...freshState.home.pagination, isLoadingMore: false },
      },
    });
  } finally {
    isLoadingMore = false;
  }
}

/**
 * HomePage - withLifecycle 적용
 */
export const Homepage = withLifecycle(
  {
    // 컴포넌트 초기화 시 1번만 실행
    async mount() {
      loadProducts();

      // 카테고리 로드 (1회만)
      const categories = await getCategories();
      store.dispatch({ type: "setCategories", payload: categories });

      // 재시도 버튼 이벤트 리스너
      document.addEventListener("click", (e) => {
        if (e.target.id === "retry-btn") {
          loadProducts();
        }
      });
    },

    // 컴포넌트 제거 시
    unmount() {
      // 무한 스크롤 해제
      teardownInfiniteScroll(scrollObserver);
      scrollObserver = null;
    },

    // 쿼리 파라미터 변경 감지
    watchs: [
      {
        target() {
          return router.getCurrentRoute().query;
        },
        callback() {
          loadProducts();
        },
      },
      // 상품 목록이 업데이트될 때마다 observer 재연결
      {
        target() {
          const state = store.getState().home;
          return { length: state.products.length, error: state.error };
        },
        callback() {
          const { error } = store.getState().home;

          // 에러 상태면 무한 스크롤 해제
          if (error) {
            if (scrollObserver) {
              teardownInfiniteScroll(scrollObserver);
              scrollObserver = null;
            }
            return;
          }

          // 기존 observer 해제 후 재연결
          if (scrollObserver) {
            teardownInfiniteScroll(scrollObserver);
          }
          setTimeout(() => {
            scrollObserver = setupInfiniteScroll("#scroll-trigger", loadMoreProducts);
          }, 100);
        },
      },
    ],
  },

  // 렌더링 함수
  () => {
    const { products, loading, pagination, error } = store.getState().home;
    const { categories } = store.getState();
    const filters = router.getCurrentRoute().query;

    return PageLayout({
      children: /* HTML */ `
        ${SearchForm({ filters, categories })} ${ProductList({ loading, products, pagination, error })}
        <!-- 무한 스크롤 트리거 -->
        <div id="scroll-trigger" class="h-1"></div>
      `,
    });
  },
);
