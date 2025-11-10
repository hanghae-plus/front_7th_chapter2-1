import { getProducts } from "./api/productApi.js";
import { Home } from "./pages/home.js";

const enableMocking = async () => {
  const { worker } = await import("./mocks/browser.js");

  return worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
  });
};

async function main() {
  const root = document.getElementById("root");

  root.innerHTML = Home({ loading: true });
  const data = await getProducts();
  setTimeout(() => {
    console.log(data);
    root.innerHTML = Home({ ...data, loading: false });
  }, 1000);
}

enableMocking().then(main);
