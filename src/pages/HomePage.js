import { ProductFilter } from "../components/filter/ProductFilter";
import { GlobalLayout } from "../components/layout/GlobalLayout";
import { ProductList } from "../components/product/ProductList";

export const HomePage = () => {
  return `
    ${GlobalLayout({
      children: `
        ${ProductFilter()}
        ${ProductList()}
      `,
    })}
  `;
};
