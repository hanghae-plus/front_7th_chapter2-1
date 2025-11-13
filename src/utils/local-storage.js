export class LocalStorage {
  static get(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`LocalStorage 데이터 읽기 실패 (key: ${key}):`, error);
      return null;
    }
  }

  static set(key, value) {
    try {
      const stringifiedValue = JSON.stringify(value);
      localStorage.setItem(key, stringifiedValue);
      return true;
    } catch (e) {
      if (e instanceof DOMException && e.name === "QuotaExceededError") {
        console.error(`LocalStorage 저장 용량 초과 (key: ${key}):`, e);
      }
      console.error(e);
      return false;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`LocalStorage 데이터 삭제 실패 (key: ${key}):`, error);
      return false;
    }
  }
}
