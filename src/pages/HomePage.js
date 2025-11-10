import { ProductList } from "../components/ProductList";
import { SearchForm } from "../components/SearchForm";
import { PageLayout } from "./PageLayout";

export const HomePage = ({ filters, pagination, products, loading }) => {
  return PageLayout({
    children: `
     ${SearchForm({ filters, pagination })}
     ${ProductList({ loading, products })}
    `,
  });
};
