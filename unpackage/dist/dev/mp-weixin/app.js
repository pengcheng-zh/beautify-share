"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const store_user = require("./store/user.js");
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
function runSilentLogin(reason) {
  try {
    const userStore = store_user.useUserStore();
    if (userStore && userStore.user) {
      common_vendor.index.__f__("log", "at App.vue:10", "[silentLogin] skip, user exists:", userStore.user.id);
      return;
    }
    common_vendor.index.__f__("log", "at App.vue:13", "[silentLogin] trigger by", reason);
    const p = userStore.silentLogin();
    if (p && typeof p.then === "function") {
      p.then((u) => {
        common_vendor.index.__f__("log", "at App.vue:17", "[silentLogin] done", u && u.id);
      }).catch((err) => {
        common_vendor.index.__f__("warn", "at App.vue:19", "[silentLogin] failed", err);
      });
    }
  } catch (err) {
    common_vendor.index.__f__("error", "at App.vue:23", "[silentLogin] sync error", err);
  }
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:29", "贤书·置换 App Launch");
    runSilentLogin("onLaunch");
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:33", "贤书·置换 App Show");
    runSilentLogin("onShow");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:38", "App Hide");
  },
  globalData: {
    appName: "贤书·置换",
    slogan: "人间烟火，书市清灵。"
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  const pinia = common_vendor.createPinia();
  app.use(pinia);
  common_vendor.setActivePinia(pinia);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
