import { Component } from "../components/Component";
import { ProductList } from "../components/ProductList";
import { SearchForm } from "../components/SearchForm";
import { CartUtil } from "../utils/cart";
import { getProducts } from "../api/productApi.js";
import {
  getQueryString,
  getQueryStringAdding,
  getQueryStringExcluding,
  getQueryStringValue,
} from "../utils/queryString";
import { PageLayout } from "./PageLayout";

export class HomePage extends Component {
  handleClick(e) {
    // 카드
    if (e.target.closest(".add-to-cart-btn")) {
      const { loaderData } = this.props;
      const productId = e.target.closest(".product-card").dataset.productId;
      const product = loaderData.products.find((product) => product.productId === productId);
      CartUtil.addCard(product);
    } else if (e.target.closest(".product-card")) {
      const productCard = e.target.closest(".product-card");
      const productId = productCard.dataset.productId;
      window.router2Instance.navigateTo(`${window.BASE_URL}product/${productId}`);
    } else if (e.target.tagName === "A") {
      e.preventDefault();
      window.router2Instance.navigateTo(e.target.pathname);
    }
    // 카테고리 필터 버튼
    if (e.target.closest(".category1-filter-btn")) {
      const $category1Btn = e.target.closest(".category1-filter-btn");
      const category1 = $category1Btn.dataset.category1;
      const currentCategory1 = getQueryStringValue("category1");
      if (category1 === currentCategory1) return;
      const newQueryString = getQueryStringAdding("category1", category1);
      window.router2Instance.navigateTo(`${window.BASE_URL}${newQueryString}`);
    } else if (e.target.closest(".category2-filter-btn")) {
      const $category2Btn = e.target.closest(".category2-filter-btn");
      const category2 = $category2Btn.dataset.category2;
      const currentCategory2 = getQueryStringValue("category2");
      if (category2 === currentCategory2) return;
      const newQueryString = getQueryStringAdding("category2", category2);
      window.router2Instance.navigateTo(`${window.BASE_URL}${newQueryString}`);
    }
    // 브레드 크럼브 클릭
    if (e.target.dataset.breadcrumb === "category1") {
      const category1 = e.target.dataset.category1;
      const currentCategory2 = getQueryStringValue("category2");
      const $input = this.$container.querySelector("#search-input");
      const newQueryString = `?search=${$input.value}&category1=${category1}`;
      if (!currentCategory2) return;
      window.router2Instance.navigateTo(`${window.BASE_URL}${newQueryString}`);
    } else if (e.target.dataset.breadcrumb === "reset") {
      const $input = this.$container.querySelector("#search-input");
      const currentCategory1 = getQueryStringValue("category1");
      const currentCategory2 = getQueryStringValue("category2");
      if (!currentCategory1 && !currentCategory2) return;
      const newQueryString = $input.value ? `?current=1&search=${$input.value}` : "?current=1&";
      window.router2Instance.navigateTo(`${window.BASE_URL}${newQueryString}`);
    }
  }

  handleKeydown(e) {
    if (e.key === "Enter") {
      const $input = e.target.closest("#search-input");

      const params = new URLSearchParams(window.location.search);
      const category1 = params.get("category1") ?? "";
      const category2 = params.get("category2") ?? "";
      let queryString = `?search=${$input.value}${category1 ? `&category1=${category1}` : ""}${category2 ? `&category2=${category2}` : ""}`;
      if ($input.value) {
        window.router2Instance.navigateTo(queryString);
      } else {
        const newQueryString = getQueryStringExcluding("search");
        window.router2Instance.navigateTo(`${window.BASE_URL}${newQueryString}`);
      }
    }
  }

  handleChange(e) {
    if (e.target.closest("#sort-select")) {
      const newQueryString = getQueryString({
        excludes: ["sort", "current"],
        adds: [
          { key: "sort", value: e.target.value },
          { key: "current", value: 1 },
        ],
      });
      window.router2Instance.navigateTo(`${window.BASE_URL}${newQueryString}`);
    } else if (e.target.closest("#limit-select")) {
      const newQueryString = getQueryString({
        excludes: ["limit", "current"],
        adds: [
          { key: "limit", value: e.target.value },
          { key: "current", value: 1 },
        ],
      });
      window.router2Instance.navigateTo(`${window.BASE_URL}${newQueryString}`);
    }
  }

  setupIntersectionObserver() {
    // DOM이 완전히 렌더링된 후 실행
    setTimeout(() => {
      const trigger = this.$container.querySelector("#load-next-page");
      if (!trigger) {
        return;
      }

      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }

      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !this.isLoading) {
              this.loadNextPage();
            }
          });
        },
        {
          root: null,
          rootMargin: "100px",
          threshold: 0.1,
        },
      );

      this.observer.observe(trigger);
    }, 100);
  }

  async loadNextPage() {
    if (this.props.isPending || this.isLoading) {
      return;
    }

    this.isLoading = true;
    try {
      const params = new URLSearchParams(window.location.search);
      const currentPage = parseInt(params.get("current") || "1");
      const nextPage = currentPage + 1;

      console.log(`현재 페이지: ${currentPage}, 다음 페이지: ${nextPage}`);
      this.updateProductList();

      // URL 업데이트 (current 파라미터 추가/업데이트)
      params.set("current", nextPage.toString());
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);

      // API 호출을 위한 파라미터 준비
      const search = params.get("search") || "";
      const category1 = params.get("category1") || "";
      const category2 = params.get("category2") || "";
      const sort = params.get("sort") || "";
      const limit = params.get("limit") || "";

      // 다음 페이지 데이터 가져오기
      const nextPageData = await getProducts({
        page: nextPage,
        search,
        category1,
        category2,
        sort,
        limit,
      });

      // 기존 상품 목록에 새 상품들 추가
      const existingProducts = this.props.loaderData.products || [];
      const newProducts = [...existingProducts, ...nextPageData.products];

      // props 업데이트
      this.props.loaderData.products = newProducts;
      this.props.loaderData.pagination = nextPageData.pagination;

      // 상품 목록만 다시 렌더링
      this.updateProductList();

      // Observer 다시 설정 (DOM이 업데이트된 후)
      this.setupIntersectionObserver();
    } catch (error) {
      console.error("다음 페이지 로드 실패:", error);
    } finally {
      this.isLoading = false;
      this.updateProductList();
    }
  }

  updateProductList() {
    // ProductList 전체 컨테이너 찾기
    const productListContainer = this.$container.querySelector(".mb-6");
    if (productListContainer && this.props.loaderData) {
      const { loaderData, isPending } = this.props;
      // ProductList 컴포넌트 다시 렌더링 (로딩 상태까지 포함)
      productListContainer.innerHTML = ProductList({
        products: loaderData.products || [],
        loading: isPending || this.isLoading,
        total: loaderData.pagination?.total || 0,
      });
    }
  }

  mount() {
    this.isLoading = false;
    this.boundHandleClick = this.handleClick.bind(this);
    this.boundHandleKeydown = this.handleKeydown.bind(this);
    this.boundHandleChange = this.handleChange.bind(this);

    this.$container.addEventListener("click", this.boundHandleClick);
    this.$container.addEventListener("keydown", this.boundHandleKeydown);
    this.$container.addEventListener("change", this.boundHandleChange);
  }

  // Component의 render 메서드를 override
  render() {
    super.render();
    // 렌더링 후 Observer 다시 설정
    this.setupIntersectionObserver();
  }

  unmount() {
    this.$container.removeEventListener("click", this.boundHandleClick);
    this.$container.removeEventListener("keydown", this.boundHandleKeydown);
    this.$container.removeEventListener("change", this.boundHandleChange);

    // Observer 정리
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  template() {
    const { loaderData, isPending, queryString } = this.props;
    return PageLayout({
      children: `
        ${SearchForm({ ...loaderData, filters: queryString /*, filters, pagination, categories */ })}
        ${ProductList({ products: loaderData?.products ?? [], loading: isPending || this.isLoading, total: loaderData?.pagination?.total ?? 0 })}
        <div id="load-next-page" style="height:20px"></div>
      `,
    });
  }
}
