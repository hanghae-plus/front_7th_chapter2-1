import { Error404 } from "../components/Error404";
import { PageLayout } from "./PageLayout";

export const ErrorPage = () => {
  return PageLayout({
    children: Error404,
  });
};
