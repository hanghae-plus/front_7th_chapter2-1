import { ProductList, SearchForm } from "../components";
import { PageLayout } from "./PageLayout.js";

export const HomePage = ({ filters, pagenation, products, loading, categories }) => {
  return PageLayout({
    children: `
        ${SearchForm({ filters, pagenation, categories, loading })}
        ${ProductList({ products, loading })}
    `,
  });
};
