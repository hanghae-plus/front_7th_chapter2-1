import { PageLayout } from "./PageLayout";
import { useState } from "../lib/hook.js";

const runtime = {
  setState: null,
  isInitializing: false,
  lastKnownSearch: "",
};

const buildView = (state) => {
  const { title, content } = state;
  return /*html*/ `
  <div id="page-template">
    ${PageLayout({
      children: `
        <section class="py-8">
          <h1 class="text-2xl font-bold mb-4">${title}</h1>
          <div>${content}</div>
        </section>
      `,
    })}
  </div>
  `;
};

const initializeData = async (state, setState) => {
  if (runtime.isInitializing) return;
  runtime.isInitializing = true;

  try {
    // TODO: fetch initial data here
    setState((prev) => ({
      ...prev,
      title: "템플릿 페이지",
      content: "여기에 페이지 내용을 채워주세요.",
    }));
  } catch (error) {
    console.error("페이지 초기화 실패", error);
  } finally {
    runtime.isInitializing = false;
  }
};

const mountPage = () => {
  const root = document.getElementById("root");
  if (!root) return () => {};

  const handleClick = (event) => {
    if (event.target.closest("[data-template-action]") == null) return;
    console.info("템플릿 액션이 호출되었습니다.");
  };

  root.addEventListener("click", handleClick);

  return () => {
    root.removeEventListener("click", handleClick);
  };
};

export const PageTemplateComponent = (context = {}) => {
  const { title = "", content = "" } = context;

  const [state, setState] = useState({
    title,
    content,
  });

  runtime.setState = setState;

  const currentSearch = window.location.search;
  if (runtime.lastKnownSearch !== currentSearch) {
    runtime.lastKnownSearch = currentSearch;
    initializeData(state, setState);
  }

  return buildView(state);
};

PageTemplateComponent.mount = mountPage;
