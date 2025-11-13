import { PageLayout } from "./PageLayout.js";
import { NotFound } from "../components/NotFound.js";

export const NotFoundPage = () => {
  return PageLayout({
    children: NotFound(),
  });
};
