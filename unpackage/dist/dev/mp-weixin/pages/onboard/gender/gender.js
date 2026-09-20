"use strict";
const common_vendor = require("../../../common/vendor.js");
const store_user = require("../../../store/user.js");
const common_api = require("../../../common/api.js");
const common_assets = require("../../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      picked: store_user.GENDER.UNKNOWN,
      genderEnum: store_user.GENDER
    };
  },
  onLoad() {
    this.userStore = store_user.useUserStore();
    this.userStore.silentLogin().then(() => {
      if (this.userStore.hasGender) {
        common_vendor.index.reLaunch({ url: "/pages/tabBar/books/books" });
      }
    });
  },
  methods: {
    pick(g) {
      this.picked = g;
    },
    async confirm() {
      if (!this.picked) {
        common_vendor.index.showToast({ title: "请先选择性别", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "保存中", mask: true });
      try {
        await common_api.authApi.updateGender(this.picked);
        this.userStore.updateUser({ gender: this.picked });
        common_vendor.index.hideLoading();
        common_vendor.index.reLaunch({ url: "/pages/tabBar/books/books" });
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: e && e.message || "保存失败，请重试",
          icon: "none"
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: $data.picked === $data.genderEnum.MALE ? 1 : "",
    c: common_vendor.o(($event) => $options.pick($data.genderEnum.MALE), "29"),
    d: common_assets._imports_1,
    e: $data.picked === $data.genderEnum.FEMALE ? 1 : "",
    f: common_vendor.o(($event) => $options.pick($data.genderEnum.FEMALE), "7c"),
    g: !$data.picked ? 1 : "",
    h: common_vendor.o((...args) => $options.confirm && $options.confirm(...args), "e8")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5fd503fa"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/onboard/gender/gender.js.map
