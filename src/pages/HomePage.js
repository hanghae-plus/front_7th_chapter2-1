import { ProductList } from "../components/products/ProductList.js";
import { Search } from "../components/search/Serach.js";
import { PageLayout } from "./PageLayout.js";
import { getProducts, getCategories } from "../api/productApi.js";

export const HomePage = async ({ limit = 20, search = "", category1 = "" }) => {
  const data = await getProducts({ limit, search, category1 });
  const categories = await getCategories();

  return PageLayout({
    children: `${Search({
      loading: false,
      categories,
      limit,
      search,
    })} ${ProductList({
      loading: false,
      products: data.products,
      pagination: data.pagination,
    })}`,
  });
};
