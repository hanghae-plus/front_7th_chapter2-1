// Export만 담당
export { setupHomePageDelegation as attachHomePageEventListeners } from "./homePageHandlers.js";
export { setupDetailPageDelegation as attachDetailPageHandlers } from "./detailPageHandlers.js";
export { setupCommonDelegation, cleanupCommonDelegation } from "./commonHandlers.js";
