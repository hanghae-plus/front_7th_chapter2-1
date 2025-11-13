export class LocalStorageUtil {
  static init(eventHandler) {
    window.addEventListener("localStorageChange", eventHandler);
  }

  static setItem(key, value) {
    localStorage.setItem(key, value);
    window.dispatchEvent(
      new CustomEvent("localStorageChange", {
        detail: { key, value, type: "setItem" },
      }),
    );
  }

  static removeItem(key) {
    localStorage.removeItem(key);
    window.dispatchEvent(
      new CustomEvent("localStorageChange", {
        detail: { key, type: "removeItem" },
      }),
    );
  }

  static getItem(key) {
    return localStorage.getItem(key);
  }

  static clear() {
    localStorage.clear();
    window.dispatchEvent(
      new CustomEvent("localStorageChange", {
        detail: { type: "clear" },
      }),
    );
  }
}
