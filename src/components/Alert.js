const addCartAlert = /*html*/ `
	<div class="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
		<div class="flex-shrink-0">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
			</svg>
		</div>
		<p class="text-sm font-medium">장바구니에 추가되었습니다</p>
		<button id="toast-close-btn" class="flex-shrink-0 ml-2 text-white hover:text-gray-200">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
			</svg>
		</button>
	</div>
`;
const delCartAlert = /*html*/ `
	<div class="bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
		<div class="flex-shrink-0">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
			</svg>
		</div>
		<p class="text-sm font-medium">선택된 상품들이 삭제되었습니다</p>
		<button id="toast-close-btn" class="flex-shrink-0 ml-2 text-white hover:text-gray-200">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
			</svg>
		</button>
	</div>
`;
const errorAlert = /*html*/ `
	<div class="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
		<div class="flex-shrink-0">
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
			</svg>
		</div>
		<p class="text-sm font-medium">오류가 발생했습니다.</p>
		<button id="toast-close-btn" class="flex-shrink-0 ml-2 text-white hover:text-gray-200">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
			</svg>
		</button>
	</div>
`;
let toastRoot = null;
let dismissTimer = null;
let activeToastType = null;

const ensureToastRoot = () => {
  if (toastRoot && document.body.contains(toastRoot)) {
    return toastRoot;
  }

  toastRoot = document.createElement("div");
  toastRoot.className = "pointer-events-none fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 transform space-y-2";
  document.body.appendChild(toastRoot);
  return toastRoot;
};

const scheduleRemoval = (toast) => {
  const clear = () => {
    if (!toastRoot) return;
    toast.remove();
    if (!toastRoot.childElementCount) {
      toastRoot.remove();
      toastRoot = null;
    }
    activeToastType = null;
  };

  const closeBtn = toast.querySelector("#toast-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        clear();
      },
      { once: true },
    );
    // id는 고유하지 않을 수 있으므로 중복을 방지하기 위해 제거한다.
    closeBtn.removeAttribute("id");
  }

  dismissTimer = window.setTimeout(() => {
    clear();
  }, 2000);
};

const getTemplateType = (template) => {
  if (template === addCartAlert) return "add";
  if (template === delCartAlert) return "delete";
  if (template === errorAlert) return "error";
  return "default";
};

export const showToast = (template) => {
  if (!template) return;

  const type = getTemplateType(template);
  if (type === activeToastType && toastRoot && document.body.contains(toastRoot)) {
    return;
  }

  const root = ensureToastRoot();

  const wrapper = document.createElement("div");
  wrapper.innerHTML = template.trim();
  const toast = wrapper.firstElementChild;
  if (!toast) return;

  toast.classList.add("pointer-events-auto");
  root.appendChild(toast);

  if (dismissTimer) {
    window.clearTimeout(dismissTimer);
    dismissTimer = null;
  }

  activeToastType = type;
  scheduleRemoval(toast);
};

export { addCartAlert, delCartAlert, errorAlert };
