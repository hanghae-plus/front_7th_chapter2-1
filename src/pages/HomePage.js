import { PageLayout } from "./PageLayout";
import { SearchForm } from "../components/search/index.js";
import { ProductList } from "../components/product/index.js";
import { getProducts, getCategories } from "../api/productApi.js";

export const HomePage = async ({ query = {} }) => {
  // 1. query에서 필터 정보 추출
  const filters = {
    search: query.search || "",
    category1: query.category1 || "",
    category2: query.category2 || "",
    sort: query.sort || "price_asc",
    limit: parseInt(query.limit) || 20,
  };

  // 2. API 호출해서 상품 데이터 및 카테고리 데이터 가져오기
  const [data, categories] = await Promise.all([getProducts(filters), getCategories()]);

  // 3. 페이지 렌더링
  return PageLayout({
    children: `
      ${SearchForm({ filters, categories })}
      ${ProductList({ loading: false, products: data.products, total: data.pagination.total })}
    `,
  });
};

/**
 * HomePage 로딩 상태 렌더링 함수
 */
HomePage.loading = () => {
  // 로딩 상태로 렌더링 (카테고리는 비어있음)
  return PageLayout({
    children: `
      ${SearchForm({ categories: {} })}
      ${ProductList({ loading: true, products: [], total: 0 })}
    `,
  });
};
