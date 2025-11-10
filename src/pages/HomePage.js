import SearchFilter from "../components/SearchFilter";
import ProductList from "../components/ProductList";
import { Router } from "../router";
import { createComponent } from "../core/BaseComponent";
import { useAsync } from "../core/useAsync";
import { getProducts } from "../api/productApi";
import { cartStore } from "../stores/cartStore";
import { showToast } from "../components/Toast";
import ErrorView from "../components/ErrorView";

const HomePage = createComponent(({ root, getState, setState, template, onMount, on }) => {
  const router = Router();

  setState({
    data: null,
    searchValue: "",
    filter: {
      page: 1,
    },
  });

  // useAsync는 로딩/에러만 관리, 데이터는 onSuccess에서 직접 처리
  const productsAsync = useAsync(() => getProducts(getState().filter), {
    onSuccess: (newData) => {
      const { filter, data: prevData } = getState();

      if (filter.page === 1) {
        // 첫 페이지면 데이터 교체
        setState({ data: newData });
      } else {
        // 무한스크롤: products만 누적, pagination은 최신값으로
        setState({
          data: {
            ...newData,
            products: [...(prevData?.products || []), ...(newData.products || [])],
          },
        });
      }
    },
    onError: (error) => {
      console.error("상품 목록 로드 실패:", error);
    },
  });

  template((state) => {
    const { searchValue = "", data } = state;
    const { isLoading, error } = productsAsync.getState();

    if (error) {
      return `
        ${SearchFilter({ isLoading: false, searchValue })}
        ${ErrorView({ message: error.message })}
      `;
    }

    const products = data?.products || [];
    const pagination = data?.pagination || {};

    return `
      ${SearchFilter({ isLoading, searchValue })}
      ${ProductList({ products, pagination, isLoading })}
    `;
  });

  // useAsync 상태 변화 구독 (로딩/에러 변경 시 리렌더링)
  productsAsync.subscribe(() => {
    setState({});
  });

  // 최초 1번만 - DOM 이벤트 위임 + 데이터 fetch
  onMount(() => {
    // 상품 목록 로드
    productsAsync.execute();

    // DOM 이벤트 위임
    const onCardClick = (e) => {
      const btn = e.target.closest(".add-to-cart-btn");
      if (btn) return;
      const card = e.target.closest(".product-card");
      if (!card) return;
      const id = card.getAttribute("data-product-id");
      if (id) router.push(`/product/${id}`);
    };

    const onAddToCart = (e) => {
      const btn = e.target.closest(".add-to-cart-btn");
      if (!btn) return;
      const id = btn.getAttribute("data-product-id");
      if (!id) return;

      const { data } = getState();
      const products = data?.products || [];
      const product = products.find((p) => p.productId === id);

      if (product) {
        cartStore.addItem(id, 1, product);
        showToast("장바구니에 추가되었습니다", "success");
      } else {
        console.error("상품을 찾을 수 없습니다:", id);
        showToast("상품 정보를 찾을 수 없습니다", "error");
      }
    };

    const onSearch = (e) => {
      const input = e.target.closest("#search-input");
      if (!input) return;
      setState({ searchValue: input.value });
    };

    const onRetry = (e) => {
      const btn = e.target.closest("#retry-btn");
      if (!btn) return;
      productsAsync.execute();
    };

    const onLoadMore = (e) => {
      const btn = e.target.closest("#load-more-btn");
      if (!btn) return;
      setState({ filter: { ...getState().filter, page: getState().filter.page + 1 } });
      productsAsync.execute();
    };

    on(root, "click", onCardClick);
    on(root, "click", onAddToCart);
    on(root, "click", onRetry);
    on(root, "input", onSearch);
    on(root, "click", onLoadMore);
  });
});

export default HomePage;
