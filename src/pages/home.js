import { Layout } from "../components/Layout.js";
import { Search } from "../components/Search.js";
import { ItemList } from "../components/ItemList.js";

export const Home = ({ searchProps = {}, productProps = {} } = {}) => {
  return `
    ${Layout({
      top: Search(searchProps),
      main: ItemList(productProps),
    })}
  `;
};
