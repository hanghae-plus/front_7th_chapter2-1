import { ProductList, SearchForm } from "../components";
import { PageLayout } from "./PageLayout.js";

export const HomePage = ({ filters, pagination, products, loading, categories }) => {
  return PageLayout({
    children: `
        ${SearchForm({ filters, pagination, categories, loading })}
        ${ProductList({ pagination, products, loading })}
    `,
  });
};
