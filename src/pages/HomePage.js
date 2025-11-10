import { PageLayout } from "./PageLayout";
import { SearchForm, ProductList } from "../components";

export const HomePage = ({ filters, pagination, products, categories, isLoading = false }) => {
  return `
   ${PageLayout({
     children: `
      ${SearchForm({ filters, pagination, categories, isLoading })}
      ${ProductList({ isLoading, pagination, products })}
    `,
   })}
  `;
};
