import { DetailPageComponent } from "../pages/DetailPage";
import { HomePageComponent } from "../pages/HomePage";

export const routes = [
  { path: "/", component: HomePageComponent },
  { path: "/product/:id", component: DetailPageComponent },
];
