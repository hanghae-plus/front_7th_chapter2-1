const listeners = new Set();
let toasts = [];
let seed = 0;

const DEFAULT_DURATION = 3000;
const TOAST_LIMIT = 4;

function notify() {
  const snapshot = [...toasts];
  listeners.forEach((listener) => listener(snapshot));
}

export function subscribeToast(listener) {
  listeners.add(listener);
  listener([...toasts]);
  return () => listeners.delete(listener);
}

export function pushToast({
  id = `toast-${seed++}`,
  type = "info",
  description,
  message,
  action, // { label: string, handler: () => void, dismissOnAction?: boolean }
}) {
  toasts = [{ id, type, description, message, action, createdAt: Date.now() }, ...toasts].slice(0, TOAST_LIMIT);

  notify();
  window.setTimeout(() => dismissToast(id), DEFAULT_DURATION);
  console.log(id);
  return id;
}

export function dismissToast(id) {
  toasts = toasts.filter((toast) => toast.id !== id);
  notify();
}

export const toast = {
  show: pushToast,
  success(message, opts = {}) {
    return pushToast({ message, type: "success", ...opts });
  },
  info(message, opts = {}) {
    return pushToast({ message, type: "info", ...opts });
  },
  error(message, opts = {}) {
    return pushToast({ message, type: "error", ...opts });
  },
  warning(message, opts = {}) {
    return pushToast({ message, type: "warning", ...opts });
  },
};
