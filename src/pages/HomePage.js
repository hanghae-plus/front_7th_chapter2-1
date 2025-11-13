import { PageLayout } from "./PageLayout";
import { SearchForm } from "../components/search/index.js";
import { ProductList, ErrorState } from "../components/product/index.js";
import { getProducts, getCategories } from "../api/productApi.js";

/**
 * HomePage
 * @param {Object} props
 * @param {Object} props.query - URL 쿼리 파라미터
 * @param {Object} props.data - mount에서 가져온 데이터
 */
export const HomePage = ({ query = {}, data = {} }) => {
  // 1. query에서 필터 정보 추출
  const filters = {
    search: query.search || "",
    category1: query.category1 || "",
    category2: query.category2 || "",
    sort: query.sort || "price_asc",
    limit: parseInt(query.limit) || 20,
  };

  // 2. data에서 정보 추출
  const { products = [], categories = {}, total = 0, error = null } = data;

  // 3. 에러 상태 렌더링
  if (error) {
    return PageLayout({
      children: `
        ${SearchForm({ filters, categories: {} })}
        ${ErrorState({ message: "상품을 불러오는데 실패했습니다" })}
      `,
    });
  }

  // 4. 정상 상태 렌더링
  return PageLayout({
    children: `
      ${SearchForm({ filters, categories })}
      ${ProductList({ loading: false, products, total })}
    `,
  });
};

/**
 * HomePage mount - API 호출 로직
 */
HomePage.mount = async ({ query = {} }) => {
  // 1. query에서 필터 정보 추출
  const filters = {
    search: query.search || "",
    category1: query.category1 || "",
    category2: query.category2 || "",
    sort: query.sort || "price_asc",
    limit: parseInt(query.limit) || 20,
  };

  try {
    // 2. API 호출해서 상품 데이터 및 카테고리 데이터 가져오기
    const [data, categories] = await Promise.all([getProducts(filters), getCategories()]);

    // 3. 데이터 반환
    return {
      products: data.products,
      categories,
      total: data.pagination.total,
    };
  } catch (error) {
    console.error("Failed to load products:", error);

    // 에러 반환
    return { error };
  }
};

/**
 * HomePage 로딩 상태 렌더링 함수
 */
HomePage.loading = ({ query = {} }) => {
  // query에서 필터 정보 추출 (로딩 상태에서도 검색어 등을 유지)
  const filters = {
    search: query.search || "",
    category1: query.category1 || "",
    category2: query.category2 || "",
    sort: query.sort || "price_asc",
    limit: parseInt(query.limit) || 20,
  };

  // 로딩 상태로 렌더링 (카테고리는 비어있음)
  return PageLayout({
    children: `
      ${SearchForm({ filters, categories: {} })}
      ${ProductList({ loading: true, products: [], total: 0 })}
    `,
  });
};
