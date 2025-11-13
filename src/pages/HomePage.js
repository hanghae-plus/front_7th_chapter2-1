import { ProductList } from "../components/products/productList/ProductList.js";
import { Search } from "../components/search/Serach.js";
import { PageLayout } from "./PageLayout.js";
import { loadHomePageData as loadHomePageDataFromLoader } from "../utils/dataLoaders.js";
import { createComponent } from "../core/component.js";
import { setupHomePageDelegation } from "../handlers/homePageHandlers.js";
import { setupCommonDelegation } from "../handlers/commonHandlers.js";
import { createStore } from "../core/store.js";

/**
 * URL에서 searchParams 파싱
 * @returns {Object} 파싱된 searchParams 객체
 */
const parseSearchParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    limit: parseInt(urlParams.get("limit")) || 20,
    search: urlParams.get("search") || "",
    category1: urlParams.get("category1") || "",
    category2: urlParams.get("category2") || "",
    current: parseInt(urlParams.get("current")) || 1,
    sort: urlParams.get("sort") || "price_asc",
  };
};

// HomePage 전용 state (각 컴포넌트가 자신의 state 관리)
const homePageState = createStore(parseSearchParams());

const template = ({
  loading = true,
  limit = 20,
  search = "",
  category1 = "",
  category2 = "",
  categories = {},
  products = [],
  pagination = { total: 0 },
  sort = "price_asc",
  error = null,
}) => {
  return PageLayout({
    children: `${Search({
      loading,
      categories,
      limit,
      search,
      sort,
      category1,
      category2,
    })} ${ProductList({
      loading,
      products,
      pagination,
      error,
    })}`,
  });
};

/**
 * HomePage 데이터 로드
 * @returns {Promise<Object>} 페이지 데이터
 */
const loadData = async () => {
  // URL에서 현재 상태 읽기
  const state = parseSearchParams();
  // state 업데이트
  homePageState.setState(state);

  return await loadHomePageDataFromLoader(state);
};

/**
 * HomePage 컴포넌트 생성
 * @returns {Object} 컴포넌트 인스턴스
 */
export const HomePage = () => {
  return createComponent({
    template: (props = {}) => {
      // HomePage state에서 현재 상태 가져오기
      const state = homePageState.getState();
      return template({
        ...state,
        ...props,
      });
    },
    setup: loadData,
    mounted: () => {
      setupHomePageDelegation();
      setupCommonDelegation();
    },
  });
};
