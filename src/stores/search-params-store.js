class SearchParamsStore {
  constructor() {
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  unsubscribe(callback) {
    this.subscribers = this.subscribers.filter((cb) => cb !== callback);
  }

  _notify() {
    this.subscribers.forEach((callback) => callback());
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

    this._notify(); // 모든 구독자에게 알림
  }

  delete(key) {
    const params = new URLSearchParams(window.location.search);
    params.delete(key);
    window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`);
    this._notify();
  }

  reset() {
    window.history.pushState({}, "", window.location.pathname);
    this._notify();
  }
}

export const searchParamsStore = new SearchParamsStore();
