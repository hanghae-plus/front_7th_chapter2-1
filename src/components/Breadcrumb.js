const category1Breadcrumb = ({ category1 }) => {
  return /* HTML */ `
    <span class="text-xs text-gray-500">&gt;</span>
    <button
      id="category1-breadcrumb"
      data-breadcrumb="category1"
      data-category1=${category1}
      class="text-xs hover:text-blue-800 hover:underline"
    >
      ${category1}
    </button>
  `;
};

const category2Breadcrumb = ({ category2 }) => {
  return /* HTML */ `
    <span class="text-xs text-gray-500">&gt;</span>
    <span class="text-xs text-gray-600 cursor-default">${category2}</span>
  `;
};

export const Breadcrumb = ({ params }) => {
  const category1 = params.get("category1");
  const category2 = params.get("category2");

  return /* HTML */ `
    <a href="/">
      <button data-breadcrumb="reset" class="text-xs hover:text-blue-800 hover:underline">전체</button>
    </a>
    ${category1 ? category1Breadcrumb({ category1 }) : ""}
    ${category1 && category2 ? category2Breadcrumb({ category2 }) : ""}
  `;
};
