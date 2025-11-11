import { PageLayout } from "./PageLayout.js";
import { SearchForm, ProductList } from "../components/index.js";

export const Homepage = ({ filters, products, pagination, loading = false }) => {
  return PageLayout(`
        ${SearchForm({ filters, pagination })}
        ${ProductList({ loading, products, pagination })}
    `);
};
