import { updateQueryParams } from "../utils/queryParams.js";
import { addCartItem } from "../utils/cartStorage.js";
import { updateCartIconCount } from "../components/common/Header.js";
import { toast } from "../utils/toast.js";

/**
 * HomePage의 이벤트 핸들러를 등록하는 함수
 */
export const setupHomePageHandlers = () => {
  const container = document.querySelector("#root");
  if (!container) return;

  // 이벤트 위임을 사용하여 동적으로 생성된 요소의 이벤트도 처리
  const handleEvent = (e) => {
    const target = e.target;

    // 검색 입력 - Enter 키
    if (target.id === "search-input" && e.type === "keydown" && e.key === "Enter") {
      e.preventDefault();
      const searchValue = target.value.trim();
      updateQueryParams({ search: searchValue || undefined, page: undefined });
      return;
    }

    // 정렬 선택
    if (target.id === "sort-select" && e.type === "change") {
      updateQueryParams({ sort: target.value, page: undefined });
      return;
    }

    // 개수 선택
    if (target.id === "limit-select" && e.type === "change") {
      updateQueryParams({ limit: target.value, page: undefined });
      return;
    }

    // 카테고리 1depth 버튼
    if (target.classList.contains("category1-filter-btn") && e.type === "click") {
      const category1 = target.dataset.category1;
      updateQueryParams({
        category1: category1 || undefined,
        category2: undefined,
        page: undefined,
      });
      return;
    }

    // 카테고리 2depth 버튼
    if (target.classList.contains("category2-filter-btn") && e.type === "click") {
      const category1 = target.dataset.category1;
      const category2 = target.dataset.category2;
      updateQueryParams({
        category1: category1,
        category2: category2 || undefined,
        page: undefined,
      });
      return;
    }

    // 브레드크럼 category1 클릭 (category2 제거)
    if (target.dataset.breadcrumb === "category1" && e.type === "click") {
      const category1 = target.dataset.category1;
      updateQueryParams({
        category1: category1,
        category2: undefined,
        page: undefined,
      });
      return;
    }

    // 브레드크럼 리셋
    if (target.dataset.breadcrumb === "reset" && e.type === "click") {
      updateQueryParams({
        category1: undefined,
        category2: undefined,
        page: undefined,
      });
      return;
    }

    if (target.classList.contains("add-to-cart-btn")) {
      // 장바구니.. 담아야해요.. 아이템 정보 어디서 얻징.. 아이템에서 추출?
      const productCard = target.closest(".product-card");

      const productId = productCard.dataset.productId;
      const title = productCard.dataset.title;
      const price = Number(productCard.dataset.price);
      const image = productCard.dataset.image;

      const product = {
        id: productId,
        title: title,
        price: price,
        image: image,
      };

      // 4. 장바구니에 추가 (수량 1)
      addCartItem(product, 1);

      // 5. 토스트 메시지
      toast.success("장바구니에 추가되었습니다");

      // 6. 아이콘 개수 업데이트
      updateCartIconCount();
    }
  };

  // 이벤트 리스너 등록
  container.addEventListener("keydown", handleEvent);
  container.addEventListener("change", handleEvent);
  container.addEventListener("click", handleEvent);

  // 클린업 함수 반환
  return () => {
    container.removeEventListener("keydown", handleEvent);
    container.removeEventListener("change", handleEvent);
    container.removeEventListener("click", handleEvent);
  };
};
