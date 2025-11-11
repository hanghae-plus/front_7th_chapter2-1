import productStore from "../Store/product.js";
import searchForm from "../components/product/searchForm.js";
import productList from "../components/product/list.js";
import skeleton from "../components/product/skeleton.js";

export function ProductListPage(queryParams) {
  /**
   * 랜더링 함수 (스토어 업데이트 시 실행)
   * */
  const handleStoreUpdate = () => {
    // 이 페이지가 DOM에 실제로 존재하는지 확인
    const productListPage = document.getElementById("product-list-page");
    if (!productListPage) {
      return;
    }

    // 상품정보, 로딩여부, 페이징 데이터 state 가져오기
    const { products, loading, pagination } = productStore.getState();
    const productListContainer = document.getElementById("product-list-container");

    if (productListContainer) {
      // 로딩 중이고, 기존 상품이 없을 때만 스켈레톤 UI 표시
      if (loading && products.length === 0) {
        productListContainer.innerHTML = skeleton();
      } else {
        productListContainer.innerHTML = productList({ list: products, hasNext: pagination.hasNext });
      }
    }
  };

  /**
   * 스토어 구독
   * TODO : 라이프 싸이클 구현을 통해 메모리 누수 관리 (unmounted 훅 필요)
   * --> 다른 페이지 접근 후 재접근 시 스토어 구독이 중복되어 실행 됨 (unmounted 훅에서 구독취소 로직 필요)
   * */
  let cancelSubscribe = productStore.subscribe(handleStoreUpdate);
  console.log("ProductListPage - Proudct 스토어 구독 취소 콜백", cancelSubscribe);

  /**
   * URL 파라미터에 따라 초기 데이터 요청
   * setParams는 state를 변경하고,
   * setParams의 내부 로직 중 this.#setState에서 notify()를 통해 리렌더링 실시 (handleStoreUpdate)
   * */
  productStore.setParams(queryParams);

  /**
   * ProductListPage.js 호출 후 초기 페이지 DOM
   * 처음에는 skeleton 호출
   * 데이터 로딩이 완료시, 구독된 handleStoreUpdate 함수 실행 (상품 목록 채워진 버전으로 리렌더링).
   * */
  const initialState = productStore.getState();
  return `
      <main id="product-list-page" class="max-w-md mx-auto px-4 py-4">
        <!-- 검색 및 필터 -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          ${searchForm(initialState.params)}
        </div>
        <!-- 상품 목록 -->
        <div id="product-list-container" class="mb-6">
          ${skeleton()}
        </div>
      </main>`;
}
