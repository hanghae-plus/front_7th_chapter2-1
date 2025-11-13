import ProductFilter from "../components/product/ProductFilter";
import ProductList from "../components/product/ProductList";
import Layout from "../components/Layout";

export default function HomePage({
  loading,
  error,
  products,
  categories,
  selectedCategory1,
  selectedCategory2,
  category2List,
  totalCount,
  isInfiniteScrolling,
  hasMore,
  cartCount = 0,
}) {
  const content = /*html*/ `
    ${ProductFilter({ loading, categories, selectedCategory1, selectedCategory2, category2List })}
    ${ProductList({ loading, error, products, totalCount, isInfiniteScrolling, hasMore })}
  `;
  return Layout({ children: content, cartCount });
}
