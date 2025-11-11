import { ProductList, SearchForm } from "../components/index.js";
import { PageLayout } from "./PageLayout.js";

export const HomePage = ({ categories, products, loading }) => {
  const { filters, pagination, products: productList } = products || {};

  return PageLayout({
    children: `
    ${SearchForm({ categories, filters, pagination })}
    ${ProductList({ loading, products: productList })}
    `,
  });
};
