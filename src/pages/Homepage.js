import { PageLayout } from "./PageLayout.js";
import { SearchForm, ProductList, CartModal } from "../components/index.js";

export const Homepage = ({ filters, products, pagination, loading = false }) => {
  const totalCount = pagination?.total ?? 0;
  return PageLayout(`
        ${SearchForm({ filters, pagination })}
        ${ProductList({ loading, products, pagination, totalCount })}
        ${CartModal()}
    `);
};
