"use strict";
const common_vendor = require("../../../common/vendor.js");
const store_user = require("../../../store/user.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      picked: ""
    };
  },
  onLoad() {
    this.userStore = store_user.useUserStore();
    if (!this.userStore.user)
      this.userStore.login();
    if (this.userStore.user && this.userStore.user.gender) {
      common_vendor.index.reLaunch({ url: "/pages/tabBar/books/books" });
    }
  },
  methods: {
    pick(g) {
      this.picked = g;
    },
    confirm() {
      if (!this.picked) {
        common_vendor.index.showToast({ title: "请先选择性别", icon: "none" });
        return;
      }
      this.userStore.updateUser({ gender: this.picked });
      common_vendor.index.reLaunch({ url: "/pages/tabBar/books/books" });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: $data.picked === "male" ? 1 : "",
    c: common_vendor.o(($event) => $options.pick("male"), "6c"),
    d: common_assets._imports_1,
    e: $data.picked === "female" ? 1 : "",
    f: common_vendor.o(($event) => $options.pick("female"), "3c"),
    g: !$data.picked ? 1 : "",
    h: common_vendor.o((...args) => $options.confirm && $options.confirm(...args), "e1")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5fd503fa"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/onboard/gender/gender.js.map
