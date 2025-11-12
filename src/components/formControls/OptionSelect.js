const OptionSelect = (id, { options, selected }) => {
  return /*html*/ `
    <select id="${id}" class="text-sm border border-gray-300 rounded px-2 py-1
                  focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
      ${
        options?.length > 0
          ? options
              .map(
                (option) => /*html*/ `
        <option value="${option.value}" ${String(option.value) === String(selected) ? "selected" : ""}>${option.label}</option>
      `,
              )
              .join("")
          : ""
      }
    </select>
  `;
};
export default OptionSelect;
