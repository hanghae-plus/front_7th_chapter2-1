import { Layout, DetailNav, DetailContent } from "../components/index.js";

export const Detail = ({ navProps = {}, contentProps = {}, bottom = "" } = {}) => {
  return `
    ${Layout({
      headerProps: { showBack: true },
      top: DetailNav(navProps),
      main: DetailContent(contentProps),
      bottom,
    })}
  `;
};
