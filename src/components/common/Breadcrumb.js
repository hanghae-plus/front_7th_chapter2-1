export default function Breadcrumb({ selectedCategory1, selectedCategory2 }) {
  const breadcrumbs = [];

  breadcrumbs.push({
    label: "전체",
    clickable: !!(selectedCategory1 || selectedCategory2),
    data: 'data-breadcrumb="all"',
    current: !selectedCategory1 && !selectedCategory2,
  });
  // depth1 카테고리를 선택한 경우
  if (selectedCategory1) {
    breadcrumbs.push({
      label: selectedCategory1,
      clickable: !!selectedCategory2,
      data: `data-breadcrumb="category1" data-value="${selectedCategory1}"`,
      current: !selectedCategory2,
    });
  }
  // depth2 카테고리를 선택한 경우
  if (selectedCategory2) {
    breadcrumbs.push({
      label: selectedCategory2,
      clickable: false,
      data: `data-breadcrumb="category2" data-value="${selectedCategory2}"`,
      current: true,
    });
  }
  // map으로 배열 풀어서 체크 가능 여부와 현재 상태에 따라 separator 분리
  const breadcrumb = breadcrumbs
    .map((item, index) => {
      const isLast = index === breadcrumbs.length - 1;
      const separator = !isLast ? `<span class="text-gray-500">></span>` : "";

      if (item.clickable && !item.current) {
        return /*html*/ `
      <button ${item.data} class="text-xs hover:text-blue-800 hover:underline">${item.label}</button>
      ${separator}
      `;
      } else {
        return /*html*/ `
        <button ${item.data} class="text-xs hover:text-blue-800 hover:underline">${item.label}</button>
        `;
      }
    })
    .join("");

  return breadcrumb;
}
