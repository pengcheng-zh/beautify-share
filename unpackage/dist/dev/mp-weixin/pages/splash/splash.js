"use strict";
const common_vendor = require("../../common/vendor.js");
const store_user = require("../../store/user.js");
const _sfc_main = {
  data() {
    return {
      chars: ["人", "间", "烟", "火", "，", "书", "市", "清", "灵", "。"],
      entered: false
    };
  },
  onLoad() {
    setTimeout(() => {
      this.goHome();
    }, 5200);
  },
  methods: {
    enter() {
      this.goHome();
    },
    async goHome() {
      if (this.entered)
        return;
      this.entered = true;
      const userStore = store_user.useUserStore();
      await userStore.silentLogin();
      if (!userStore.user) {
        this.entered = false;
        common_vendor.index.showToast({ title: "登录失败，请点击屏幕重试", icon: "none" });
        return;
      }
      common_vendor.index.reLaunch({
        url: userStore.hasGender ? "/pages/tabBar/books/books" : "/pages/onboard/gender/gender"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.chars, (ch, i, i0) => {
      return {
        a: common_vendor.t(ch),
        b: i,
        c: 0.8 + i * 0.35 + "s"
      };
    }),
    b: common_vendor.o((...args) => $options.enter && $options.enter(...args), "d5")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-b5d3b004"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/splash/splash.js.map
