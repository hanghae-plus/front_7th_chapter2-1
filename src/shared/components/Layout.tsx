import { DomNode } from "@core/jsx/factory";
import { Topbar } from "./Topbar";
import { Footer } from "./Footer";

export function Layout({ children }: { children?: DomNode }) {
  return (
    <div>
      <Topbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
