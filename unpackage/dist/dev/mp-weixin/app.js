"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/splash/splash.js";
  "./pages/onboard/gender/gender.js";
  "./pages/tabBar/books/books.js";
  "./pages/tabBar/mine/mine.js";
  "./pages/publish/publish.js";
  "./pages/detail/detail.js";
  "./pages/mine/profile-edit.js";
  "./pages/mine/records.js";
  "./pages/mine/likes.js";
  "./pages/mine/favorites.js";
  "./pages/mine/shares.js";
  "./pages/admin/audit.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:4", "贤书·置换 App Launch");
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:7", "贤书·置换 App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:10", "App Hide");
  },
  globalData: {
    appName: "贤书·置换",
    slogan: "人间烟火，书市清灵。"
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.use(common_vendor.createPinia());
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
