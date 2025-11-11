export const getPath = () => window.location.pathname;

export const getPickPath = (input) => {
  const path = getPath();
  return path.split(input)[1];
};
