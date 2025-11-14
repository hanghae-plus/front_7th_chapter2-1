import { PageLayout } from "./PageLayout.js";
import { CartModal, ProductDetail } from "../components/index.js";

export const DetailPage = ({ loading, ...product }) => {
  return PageLayout(
    `
    ${ProductDetail({ loading, ...product })}
    ${CartModal()}
  `,
    "상품 상세",
  );
};
