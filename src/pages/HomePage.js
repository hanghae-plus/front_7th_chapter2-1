import { ProductList } from "../components/product/ProductList";
import { SearchForm } from "../components/search/SearchForm";
import { PageLayout } from "./PageLayout";

export const HomePage = () => {
  const $root = document.querySelector("#root");

  const render = () => {
    console.log("homepaage render 호출");
    $root.innerHTML = PageLayout(); // main-view가 비어있는 상태로 렌더링

    const $mainContentView = document.querySelector("#main-content-view");

    const $searchForm = SearchForm();
    const $ProductList = ProductList();

    $mainContentView.append($searchForm, $ProductList);
  };

  render();
};
