export const escapeHtml = (value = "") =>
  String(value).replace(/[<>"']/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });

export const formatCurrency = (value) => {
  const numeric = Number.parseInt(value, 10);
  if (Number.isNaN(numeric)) {
    return "0";
  }
  return new Intl.NumberFormat("ko-KR").format(numeric);
};
