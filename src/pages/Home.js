import Layout from "../components/Layout";
import ProductList from "../components/ProductList";

const Home = () => {
  return `
  ${Layout(ProductList)}
  `;
};

export default Home;
