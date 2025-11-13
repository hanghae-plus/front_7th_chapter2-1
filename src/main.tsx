import { render } from "@core/render";
import { Router } from "./pages/routes";
import { Topbar } from "./shared/components/Topbar";
import { Footer } from "./shared/components/Footer";
import { NotFound } from "./pages/404";
import { ErrorPage } from "./pages/500";
import { ToastContainer } from "./shared/components/Toast";
import { OverlayContainer } from "./shared/components/Overlay";

function main() {
  render(
    <div className="flex flex-col h-screen w-full bg-gray-50">
      <div className="flex-1">
        <Router
          fallback={{
            notFound: NotFound,
            error: ErrorPage,
          }}
        />
      </div>
      <ToastContainer />
      <OverlayContainer />
    </div>,
  );
}

const enableMocking = () =>
  import("./mocks/browser").then(({ worker }) =>
    worker.start({
      onUnhandledRequest: "bypass",
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
    }),
  );

if (import.meta.env.MODE !== "test") {
  enableMocking().then(main);
} else {
  main();
}
