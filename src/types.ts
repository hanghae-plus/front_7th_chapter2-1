export type SortOptions = "price_asc" | "price_desc" | "name_asc" | "name_desc";

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type Filters = {
  search: string;
  category1: string;
  category2: string;
  sort: SortOptions;
};

export interface GetProductsParams extends Partial<Filters> {
  limit?: number;
  current?: number;
  page?: number;
}

export interface GetProductsResponse {
  products: ProductItem[];
  pagination: Pagination;
  filters: Filters;
}

export interface ProductItem {
  title: string;
  link: string;
  image: string;
  lprice: string;
  hprice: string;
  mallName: string;
  productId: string;
  productType: string;
  brand: string;
  maker: string;
  category1: string;
  category2: string;
  category3: string;
  category4: string;
}
