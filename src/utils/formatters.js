export const formatNumber = (num) => {
  let number = Number(num ?? 0);
  return number.toLocaleString();
};
