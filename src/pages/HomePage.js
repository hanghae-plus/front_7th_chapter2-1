import { SearchForm } from "../components/SearchForm.js";
import { ProductList } from "../components/ProductList.js";

export const HomePage = ({ products, loading, pagination, filters }) => {
  return /* html */ `
    <div>
      ${SearchForm({ filters, pagination })}
      ${ProductList({ loading, products, pagination })}
    </div>
  `;
};
