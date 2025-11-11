import { Layout } from "../components/Layout.js";
import { DetailNav } from "../components/DetailNav.js";
import { DetailContent } from "../components/DetailContent.js";

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
