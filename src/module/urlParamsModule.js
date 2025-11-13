const urlParamsModule = () => {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  const setParams = (key, value) => {
    params.set(key, value);
    window.history.replaceState({}, "", `${url.pathname}?${params}`);
  };

  const deleteParams = (key) => {
    params.delete(key);
    window.history.replaceState({}, "", `${url.pathname}?${params}`);
  };

  const getParams = (key) => {
    return params.get(key);
  };

  const getAllParams = () => {
    return Object.fromEntries(params.entries());
  };

  return { setParams, getParams, getAllParams, deleteParams };
};

export default urlParamsModule;
