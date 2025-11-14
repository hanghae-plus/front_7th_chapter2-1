import { deleteProductToast, errorToast, successAddCartToast } from "../components/Toast";

const stringToDomNode = (htmlString) => {
  const template = document.createElement("template");
  template.innerHTML = htmlString.trim();
  return template.content.firstChild;
};

export const showToast = (type) => {
  const getToastHtml = () => {
    if (type === "success") return successAddCartToast();
    if (type === "delete") return deleteProductToast();
    if (type === "error") return errorToast();
    return "";
  };

  let toastRootDiv = document.querySelector("#toastRoot");

  if (!toastRootDiv) {
    toastRootDiv = document.createElement("div");
    toastRootDiv.className = "flex flex-col gap-2 items-center justify-center mx-auto";
    toastRootDiv.id = "toastRoot";
    toastRootDiv.style.width = "fit-content";

    toastRootDiv.style.position = "fixed";
    toastRootDiv.style.bottom = "20px";
    toastRootDiv.style.left = "50%";
    toastRootDiv.style.transform = "translateX(-50%)";
    toastRootDiv.style.zIndex = "100";

    document.body.appendChild(toastRootDiv);
  }

  const toastNode = stringToDomNode(getToastHtml());

  if (toastNode) {
    toastRootDiv.appendChild(toastNode);

    const removeToast = () => {
      toastNode.remove();

      if (toastRootDiv && toastRootDiv.children.length === 0) {
        toastRootDiv.remove();
      }
    };

    const timer = setTimeout(removeToast, 3000);

    const closeButton = toastNode.querySelector(".toast-close-btn");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        clearTimeout(timer);
        removeToast();
      });
    }
  }
};
