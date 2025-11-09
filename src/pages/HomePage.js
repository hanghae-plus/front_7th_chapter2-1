import { PageLayout } from "./PageLayout";
import { SearchForm } from "../components/search/index.js";
import { ProductList } from "../components/product/index.js";

export const HomePage = ({ filters, pagination, products, loading }) => {
  return PageLayout({
    children: `
      ${SearchForm({ filters, pagination })}
      ${ProductList({ loading, products })}
    `,
  });
};
