import { ProductList, SearchForm } from "../components";
import { PageLayout } from "./PageLayout.js";

export const HomePage = ({ filters, pagination, products, loading, categories, pageTitle }) => {
  return PageLayout({
    pageTitle,
    children: `
        ${SearchForm({ filters, pagination, categories, loading })}
        ${ProductList({ pagination, products, loading })}
    `,
  });
};
