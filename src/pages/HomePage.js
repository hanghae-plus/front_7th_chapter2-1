import { PageLayout } from "./PageLayout.js";
import { SearchForm, ProductList } from "../components/index.js";

export const HomePage = ({ filters = {}, products, loading, error }) => {
  const limit = filters?.limit ?? 20;
  const sort = filters?.sort ?? "price_asc";
  const search = filters?.search ?? "";

  return PageLayout({
    children: `
      ${SearchForm({ limit, sort, search })}
      ${ProductList({ loading, products, error })}
    `,
  });
};
