export class Observer {
  constructor() {
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.unsubscribe(callback);
    };
  }

  unsubscribe(callback) {
    this.subscribers = this.subscribers.filter((cb) => cb !== callback);
  }

  notify(data) {
    this.subscribers.forEach((callback) => callback(data));
  }

  clearSubscribers() {
    this.subscribers = [];
  }
}
