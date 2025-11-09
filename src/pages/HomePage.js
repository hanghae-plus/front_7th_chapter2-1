import { ProductList, SearchForm } from "../components";
import { PageLayout } from "./PageLayout";

export const HomePage = ({ filters, products, pagination, loading = false }) => {
  return PageLayout({
    children: `
      ${SearchForm({ filters, pagination })}
      ${ProductList({ loading, products })}
    `,
  });
};
