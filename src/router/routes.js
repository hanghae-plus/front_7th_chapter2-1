import { renderDetailPage } from "../pages/DetailPage";
import { renderHomePage } from "../pages/HomePage";

export const routes = [
  { path: "/", render: renderHomePage },
  { path: "/products/:id", render: renderDetailPage },
];
