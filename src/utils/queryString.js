export const getQueryStringExcluding = (keyToExclude) => {
  const currentParams = new URLSearchParams(window.location.search);
  const newParams = new URLSearchParams();

  for (const [key, value] of currentParams.entries()) {
    if (key !== keyToExclude) {
      newParams.append(key, value);
    }
  }

  const newQueryString = "?" + newParams.toString();
  return newParams.toString() ? newQueryString : "";
};

export const getQueryStringAdding = (newKey, value) => {
  const currentParams = new URLSearchParams(window.location.search);
  const newParams = new URLSearchParams();

  for (const [key, value] of currentParams.entries()) {
    if (key !== newKey) {
      newParams.append(key, value);
    }
  }
  newParams.append(newKey, value);

  return "?" + newParams.toString();
};

export const getQueryStringValue = (name) => {
  const currentParams = new URLSearchParams(window.location.search);
  return currentParams.get(name);
};
