import { GetProductsParams, ProductItem, Pagination } from "@/types";

export type ProductState = {
  loading: boolean;
  products: ProductItem[];
  error: string | null;
  params: GetProductsParams;
  pagination: Pagination | null;
};

function createProductStore(initialState: ProductState) {
  let state = initialState;
  const observers = [];

  /**
   * 현재 상태(state)를 가져오는 함수
   */
  const getState = () => state;

  /**
   * 상태(state)를 업데이트 하는 함수
   */
  const setState = (partial: Partial<ProductState>) => {
    state = { ...state, ...partial };

    // 모든 옵저버 함수 실행 => 화면 다시 렌더링
    observers.forEach((observer) => observer(state));
  };

  /**
   * 상태 변화를 구독(subscribe)하는 함수
   */
  const subscribe = (observer: (state: ProductState) => void) => {
    // 1) 구독자 목록에 observer 추가
    observers.push(observer);
    // 2) 구독하자마자 현재 상태를 한번 실행
    observer(state);
    // 3) unsubscribe 기능 반환 => 구독 해제
    return () => {
      const index = observers.indexOf(observer);
      if (index > -1) observers.splice(index, 1);
    };
  };

  return { getState, setState, subscribe };
}

export const productStore = createProductStore({
  loading: false,
  products: [],
  error: null,
  params: {
    limit: 20,
    search: "",
    category1: "",
    category2: "",
    sort: "price_asc",
  },
  pagination: null,
});
