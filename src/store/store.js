import { createStore } from "./createStore";

const params = new URLSearchParams(location.search);
const category1 = params.get("category1");
const category2 = params.get("category2");
const search = params.get("search");

export const initialState = {
  search: search || "",
  pagination: { page: 1, limit: 20 },
  products: [],
  categories: {},
  category1: category1 || "",
  category2: category2 || "",
  loading: category1 ? false : true,
};

export const store = createStore(initialState);
