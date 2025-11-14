import { store } from "@/store/store.js";
import { Breadcrumb } from "./Breadcrumb";
import { Product } from "./Product";
import { ProductSkeleton } from "./Skeleton";

export const DetailProduct = () => {
  const { isFetching } = store.state;

  if (isFetching) {
    return html`${ProductSkeleton()}`;
  }

  return html` ${Breadcrumb()} ${Product()} `;
};
