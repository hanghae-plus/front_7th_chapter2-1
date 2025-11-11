import { PageLayout } from "./PageLayout.js";
import { SearchForm, ProductList } from "../components/index.js";

export const HomePage = ({ filters, pagination, products, loading, error }) => {
  return PageLayout({
    children: `
      ${SearchForm({ filters, pagination })}
      ${ProductList({ loading, products, error })}
    `,
  });
};
