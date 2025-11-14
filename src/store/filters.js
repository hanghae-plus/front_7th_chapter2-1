import { createStore } from "./store";

export const filters = createStore({
  limit: "20",
  search: "",
  category1: "",
  category2: "",
  sort: "price_asc",
});
