import ProductFilter from "../components/product/ProductFilter";
import ProductList from "../components/product/ProductList";
import Layout from "../components/Layout";

export default function HomePage({ loading, error, products, categories, selectedCategory1, category2List }) {
  const content = /*html*/ `
    ${ProductFilter({ loading, categories, selectedCategory1, category2List })}
    ${ProductList({ loading, error, products })}
  `;
  return Layout({ children: content });
}
