import { ProductList } from "../components/ProductList";
import { SearchForm } from "../components/SearchForm";
import { PageLayout } from "./PageLayout";

export const HomePage = ({ filters, pagination, products, loading = false, search = "" }) => {
  return PageLayout({
    children: `
    ${SearchForm({ filters, pagination, loading, search })}
    ${ProductList({ products, loading, total: pagination?.total ?? 0 })}
    `,
  });
};
