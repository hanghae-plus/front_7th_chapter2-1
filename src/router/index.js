import { createRouter } from "./router.js";
import { setupRoutes } from "./routes.js";

// 라우터 생성 및 라우트 설정
const router = createRouter();
setupRoutes(router);

export { router };
