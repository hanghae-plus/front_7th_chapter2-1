import { PageLayout } from "./PageLayout";
import { SearchForm, ProductList } from "../components";

export const HomePage = ({ filters, pagination, products, loading = false }) => {
  return `
  ${PageLayout({
    children: `
    ${SearchForm({ filters, pagination })}
    ${ProductList({ products, loading })}
    `,
  })}
  `;
};
