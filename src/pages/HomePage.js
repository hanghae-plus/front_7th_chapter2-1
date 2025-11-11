import { ProductList } from "../components/ProductList";
import { SearchForm } from "../components/SearchForm";
import { PageLayout } from "./PageLayout";

export const HomePage = ({ filters, pagination, products, loading = false }) => {
  return PageLayout({
    children: `
    ${SearchForm({ filters, pagination, loading })}
    ${ProductList({ products, loading, total: pagination?.total ?? 0 })}
    `,
  });
};
