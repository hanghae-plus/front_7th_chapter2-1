let isToastVisible = false;
const TOAST_CONTAINER_CLASS =
  "toast-container fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 items-center";

const getToastContainer = () => {
  const appRootDiv = document.querySelector("#root > div ");
  if (!appRootDiv) return null;
  let container = appRootDiv.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = TOAST_CONTAINER_CLASS;
    appRootDiv.appendChild(container);
  }
  return container;
};
const ToastTemplate = ({ color, text }) => {
  return /*html*/ `
<div class="flex flex-col gap-2 items-center justify-center mx-auto" style="width: fit-content;">
  <div class="${color} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
    <div class="flex-shrink-0">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
    </div>
    <p class="text-sm font-medium">${text}</p>
    <button id="toast-close-btn" class="flex-shrink-0 ml-2 text-white hover:text-gray-200">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  </div>
</div>`;
};

const getToastTemplateByType = (type) => {
  if (type === "addCart") {
    return ToastTemplate({
      color: "bg-green-600",
      text: "장바구니에 추가되었습니다",
    });
  }
  if (type === "removeCart") {
    return ToastTemplate({
      color: "bg-blue-600",
      text: "선택된 상품들이 삭제되었습니다",
    });
  }
  return ToastTemplate({
    color: "bg-red-600",
    text: "오류가 발생했습니다.",
  });
};

export const showToast = (type) => {
  if (isToastVisible) return;
  const container = getToastContainer();
  if (!container) return;
  container.innerHTML = getToastTemplateByType(type);
  isToastVisible = true;

  const close = () => {
    container.innerHTML = "";
    isToastVisible = false;
  };

  container.querySelector("#toast-close-btn")?.addEventListener("click", close);
  setTimeout(close, 2000);
};
