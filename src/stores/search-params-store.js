import { Observer } from "../core/Observer";

class SearchParamsStore extends Observer {
  constructor() {
    super();
  }

  get(key) {
    const params = new URLSearchParams(window.location.search);

    if (key) {
      return params.get(key);
    }

    // 전체 반환
    const result = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  set(updates) {
    const params = new URLSearchParams(window.location.search);

    // 업데이트 적용
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);

    this.notify();
  }

  delete(key) {
    const params = new URLSearchParams(window.location.search);
    params.delete(key);
    window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`);
    this.notify();
  }

  reset() {
    window.history.pushState({}, "", window.location.pathname);
    this.notify();
  }
}

export const searchParamsStore = new SearchParamsStore();
