const Base = () => {
  const render = () => {};
  const addEventListeners = () => {};
  const removeEventListeners = () => {};

  const onMount = () => {
    render();
    addEventListeners();
  };
  const onUpdate = () => {
    render();
  };
  const onUnMount = () => {
    removeEventListeners();
  };

  return {
    onMount,
    onUpdate,
    onUnMount,
  };
};

export default Base;
