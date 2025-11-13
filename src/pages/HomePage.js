import { ProductList } from "../components/products/productList/ProductList.js";
import { Search } from "../components/search/Serach.js";
import { PageLayout } from "./PageLayout.js";
import { loadHomePageData as loadHomePageDataFromLoader } from "../utils/dataLoaders.js";
import { createComponent } from "../core/component.js";
import { setupHomePageDelegation } from "../handlers/homePageHandlers.js";
import { setupCommonDelegation } from "../handlers/commonHandlers.js";

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
    })}`,
  });
};

/**
 * HomePage 데이터 로드
 * @param {Object} state - 페이지 상태
 * @returns {Promise<Object>} 페이지 데이터
 */
const loadData = async (state) => {
  return await loadHomePageDataFromLoader(state);
};

/**
 * HomePage 컴포넌트 생성
 * @returns {Object} 컴포넌트 인스턴스
 */
export const HomePage = () => {
  return createComponent({
    template,
    setup: loadData,
    mounted: () => {
      setupHomePageDelegation();
      setupCommonDelegation();
    },
  });
};
