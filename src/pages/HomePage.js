import { ProductList } from "../components/ProductList";
import { SearchForm } from "../components/SearchForm";
import { PageLayout } from "./PageLayout";

export const HomePage = ({ filters, pagination, products, loading = false, categories }) => {
  return PageLayout({
    children: `
    ${SearchForm({ filters, pagination, loading, categories })}
    ${ProductList({ products, loading, total: pagination?.total ?? 0 })}
    `,
  });
};
