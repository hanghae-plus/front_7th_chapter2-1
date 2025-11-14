import { PageLayout } from "./PageLayout";
import { SearchForm, ProductList } from "../components";

export const HomePage = ({ filters, pagination, products, categories, isLoading = false }) => {
  return /* HTML */ `
    ${PageLayout({
      children: `
      ${SearchForm({ filters, categories, isLoading })}
      ${ProductList({ pagination, products, isLoading })}
      `,
    })}
  `;
};
