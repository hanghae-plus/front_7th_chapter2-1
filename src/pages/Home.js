import { getProducts } from "../api/productApi.js";
import { store } from "../store/store.js";
import { useEffect } from "../hooks/useEffect.js";
import { Search } from "../components/Search.js";
import { ProductList } from "../components/ProductList.js";
import { syncStateToURL, getStateFromURL } from "../utils/urlSync.js";

let lastFetchParams = null;
let isInitialized = false; // 초기화 플래그
let lastPage = 1; // 마지막으로 로드한 페이지
let isFetching = false; // 현재 fetch 중인지 확인

const fetchProductsWithParams = (filters, pagination, isInfiniteScroll = false) => {
  const params = {
    current: pagination.page,
    limit: pagination.limit,
    ...(filters.search && { search: filters.search }),
    ...(filters.category1 && { category1: filters.category1 }),
    ...(filters.category2 && { category2: filters.category2 }),
    sort: filters.sort,
  };

  // 정렬된 키로 일관된 문자열 생성
  const paramsString = `${params.current}|${params.limit}|${params.search || ""}|${params.category1 || ""}|${params.category2 || ""}|${params.sort}`;

  // 같은 파라미터로 이미 fetch했으면 스킵 (무한 스크롤은 제외)
  if (lastFetchParams === paramsString && !isInfiniteScroll) {
    return;
  }

  // 이미 fetch 중이면 스킵
  if (isFetching) {
    return;
  }

  lastFetchParams = paramsString;
  isFetching = true;
  store.setState({ isLoading: true });

  getProducts(params)
    .then((data) => {
      // 무한 스크롤인 경우 기존 products에 추가
      if (isInfiniteScroll && pagination.page > lastPage) {
        const currentProducts = store.getState("products");
        store.setState({
          products: [...currentProducts, ...data.products],
          pagination: data.pagination,
          filters: data.filters,
          isLoading: false,
        });
        lastPage = pagination.page;
      } else {
        // 일반 페이지 로드인 경우 교체
        store.setState({ ...data, isLoading: false });
        lastPage = pagination.page;
      }
      isFetching = false;
    })
    .catch(() => {
      store.setState({
        isLoading: false,
        isError: true,
        toast: { isOpen: true, type: "error" },
      });
      isFetching = false;
    });
};

export const Home = () => {
  const { isError, filters, pagination } = store.getState();

  // 초기 로드 시 URL에서 상태 복원
  useEffect(() => {
    if (isInitialized) return;
    isInitialized = true;

    const urlState = getStateFromURL();

    // 변수 초기화
    lastFetchParams = null;
    lastPage = urlState.pagination.page || 1; // URL에서 가져온 페이지로 설정
    isFetching = false; // fetch 상태도 리셋

    // URL에 쿼리 파라미터가 있으면 store에 반영
    if (
      urlState.filters.search ||
      urlState.filters.category1 ||
      urlState.filters.category2 ||
      urlState.filters.sort !== "price_asc" ||
      urlState.pagination.page > 1 ||
      urlState.pagination.limit !== 20
    ) {
      store.setState({
        filters: urlState.filters,
        pagination: { ...store.getState("pagination"), ...urlState.pagination },
      });
      // setState 후 렌더링이 발생하면 두 번째 useEffect가 실행되므로 여기서는 fetch 안 함
      return;
    }

    // URL에 파라미터가 없으면 초기 데이터 fetch
    fetchProductsWithParams(filters, pagination);
  }, []);

  // filters나 pagination이 변경될 때마다 URL 동기화 및 데이터 fetch
  useEffect(() => {
    if (!isInitialized) return; // 초기화 전에는 실행 안 함

    // 페이지가 증가했는지 확인 (무한 스크롤)
    const isInfiniteScroll = pagination.page > lastPage && pagination.page > 1;

    // 필터나 정렬, limit이 변경되면 page는 1로 되돌아가므로 리셋
    // 단, 이미 page=1이고 lastPage=1이면 리셋 안 함 (중복 방지)
    if (pagination.page === 1 && lastPage > 1) {
      lastPage = 1; // 1페이지로 리셋
      lastFetchParams = null; // 캐시도 리셋
    }

    // URL에 현재 상태 반영 (렌더링 트리거 없이)
    // 무한 스크롤일 때는 URL 업데이트 안 함
    if (!isInfiniteScroll) {
      syncStateToURL(filters, pagination);
    }

    // 데이터 fetch
    fetchProductsWithParams(filters, pagination, isInfiniteScroll);
  }, [filters.search, filters.category1, filters.category2, filters.sort, pagination.page, pagination.limit]);

  return /*html*/ `
  <!-- 검색 및 필터 -->
  ${Search()}
  <!-- 상품 목록 -->
  ${
    isError
      ? /*html*/ `
      <div class="text-center py-8">
      <div class="text-600 mb-4">오류가 발생했습니다.</div>
      <button id="retry-fetch-btn" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">다시 시도</button>
      </div>`
      : ProductList()
  }
  `;
};
