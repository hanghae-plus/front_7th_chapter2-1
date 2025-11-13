export class IntersectionObserverWrapper {
  constructor(callback, options = {}) {
    const { root = null, rootMargin = "0px", threshold = 0 } = options;

    this.callback = callback;
    this.observer = new IntersectionObserver(
      (entries) => {
        this.callback(entries);
      },
      {
        root,
        rootMargin,
        threshold,
      },
    );
    this.observedElements = new Set();
  }

  observe(element) {
    if (!element) return;

    this.observer.observe(element);
    this.observedElements.add(element);
  }

  unobserve(element) {
    if (!element) return;

    this.observer.unobserve(element);
    this.observedElements.delete(element);
  }

  disconnect() {
    this.observer.disconnect();
    this.observedElements.clear();
  }
}
