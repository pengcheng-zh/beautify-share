"use strict";
const common_vendor = require("../../common/vendor.js");
const store_user = require("../../store/user.js");
const AVATAR_COLORS = ["#07C160", "#576B95", "#E6A23C", "#5B8FF9", "#9254DE", "#FF7A45"];
const _sfc_main = {
  data() {
    return {
      form: { avatar: "", nickname: "", sign: "", location: "" }
    };
  },
  computed: {
    avatarBg() {
      const name = this.form.nickname || "书";
      let h = 0;
      for (let i = 0; i < name.length; i++)
        h = (h * 31 + name.charCodeAt(i)) % 997;
      return AVATAR_COLORS[h % AVATAR_COLORS.length];
    }
  },
  onLoad() {
    this.userStore = store_user.useUserStore();
    const u = this.userStore.user || {};
    this.form = {
      avatar: u.avatar || "",
      nickname: u.nickname || "",
      sign: u.sign || "",
      location: u.location || ""
    };
  },
  methods: {
    chooseAvatar() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          const temp = res.tempFilePaths[0];
          common_vendor.index.saveFile({
            tempFilePath: temp,
            success: (r) => {
              this.form.avatar = r.savedFilePath;
            },
            fail: () => {
              this.form.avatar = temp;
            }
          });
        }
      });
    },
    chooseLocation() {
      common_vendor.index.chooseLocation({
        success: (res) => {
          this.form.location = res.name || res.address || "所选位置";
        },
        fail: (err) => {
          if (err && err.errMsg && err.errMsg.indexOf("cancel") > -1) {
            return;
          }
          common_vendor.index.showToast({ title: "未能打开地图选点，请检查定位权限", icon: "none" });
        }
      });
    },
    save() {
      const nickname = this.form.nickname.trim();
      if (!nickname) {
        common_vendor.index.showToast({ title: "昵称不能为空", icon: "none" });
        return;
      }
      this.userStore.updateUser({
        avatar: this.form.avatar || "",
        nickname,
        sign: this.form.sign.trim(),
        location: this.form.location.trim()
      });
      common_vendor.index.showToast({ title: "资料已更新", icon: "none" });
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 600);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.form.avatar
  }, $data.form.avatar ? {
    b: $data.form.avatar
  } : {
    c: common_vendor.t(($data.form.nickname || "书").slice(0, 1))
  }, {
    d: $options.avatarBg,
    e: $data.form.avatar
  }, $data.form.avatar ? {
    f: common_vendor.o(($event) => $data.form.avatar = "", "9e")
  } : {}, {
    g: common_vendor.o((...args) => $options.chooseAvatar && $options.chooseAvatar(...args), "55"),
    h: $data.form.nickname,
    i: common_vendor.o(($event) => $data.form.nickname = $event.detail.value, "29"),
    j: $data.form.sign,
    k: common_vendor.o(($event) => $data.form.sign = $event.detail.value, "d7"),
    l: common_vendor.t($data.form.sign.length),
    m: common_vendor.t($data.form.location || "选择常驻书市位置"),
    n: common_vendor.o((...args) => $options.chooseLocation && $options.chooseLocation(...args), "7f"),
    o: $data.form.location
  }, $data.form.location ? {
    p: common_vendor.o(($event) => $data.form.location = "", "30")
  } : {}, {
    q: common_vendor.o((...args) => $options.save && $options.save(...args), "6b")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0ee0ae21"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/profile-edit.js.map
