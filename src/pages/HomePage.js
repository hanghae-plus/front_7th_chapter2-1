import { ProductList } from "../components/ProductList";
import { SearchForm } from "../components/SearchForm";

export const HomePage = ({ filters, pagination, products, loading }) => {
  return `
     ${SearchForm({ filters, pagination })}
     ${ProductList({ loading, products })}
    `;
};
