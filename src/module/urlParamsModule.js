const urlParamsModule = () => {
  const setParams = (key, value) => {
    // undefined, null, 빈 문자열은 설정하지 않음
    if (value === undefined || value === null || value === "") {
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState({}, "", `${url.pathname}?${url.searchParams}`);
  };

  const deleteParams = (key) => {
    const url = new URL(window.location.href);
    url.searchParams.delete(key);
    window.history.replaceState({}, "", `${url.pathname}?${url.searchParams}`);
  };

  const getParams = (key) => {
    const url = new URL(window.location.href);
    return url.searchParams.get(key);
  };

  const getAllParams = () => {
    const url = new URL(window.location.href);
    return Object.fromEntries(url.searchParams.entries());
  };

  return { setParams, getParams, getAllParams, deleteParams };
};

export default urlParamsModule;
