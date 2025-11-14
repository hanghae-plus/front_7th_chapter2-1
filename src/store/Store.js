class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.observers = new Map();
  }

  getState(key) {
    return this.state[key];
  }

  setState(key, value) {
    this.state[key] = value;
    this.notify(key);
  }

  subscribe(key, callback) {
    if (!this.observers.has(key)) {
      this.observers.set(key, []);
    }
    this.observers.get(key).push(callback);

    return () => {
      const callbacks = this.observers.get(key);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  notify(key) {
    const callbacks = this.observers.get(key);
    if (callbacks) {
      callbacks.forEach((callback) => callback(this.state[key]));
    }
  }

  clearObservers() {
    this.observers.clear();
  }
}

export const store = new Store();
