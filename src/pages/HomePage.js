import { ProductList } from "../components/products/productList/ProductList.js";
import { Search } from "../components/search/Serach.js";
import { PageLayout } from "./PageLayout.js";

// loading prop에 따라 UI 분기
export const HomePage = ({
  loading = true,
  limit = 20,
  search = "",
  category1 = "",
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
    })} ${ProductList({
      loading,
      products,
      pagination,
    })}`,
  });
};
