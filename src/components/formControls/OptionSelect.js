const OptionSelect = (options) => {
  return /*html*/ `
    <select id="sort-select" class="text-sm border border-gray-300 rounded px-2 py-1
                  focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
      ${options
        .map(
          (option) => /*html*/ `
        <option value="${option.value}" ${option.selected ? "selected" : ""}>${option.label}</option>
      `,
        )
        .join("")}
    </select>
  `;
};
export default OptionSelect;
