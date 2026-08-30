"use strict";
const common_vendor = require("../../../common/vendor.js");
const store_content = require("../../../store/content.js");
const store_user = require("../../../store/user.js");
const common_format = require("../../../common/format.js");
const _sfc_main = {
  data() {
    return {
      greet: ""
    };
  },
  computed: {
    user() {
      return this.userStore ? this.userStore.user || {} : {};
    },
    nickname() {
      return this.user.nickname || "书友";
    },
    avatarBg() {
      const colors = ["#07C160", "#576B95", "#E6A23C", "#5B8FF9"];
      let h = 0;
      const id = this.user.id || "u1";
      for (let i = 0; i < id.length; i++)
        h = (h * 31 + id.charCodeAt(i)) % 997;
      return colors[h % colors.length];
    },
    isAdmin() {
      return this.userStore ? this.userStore.isAdmin : false;
    },
    myContents() {
      return this.contentStore ? this.contentStore.myContents() : [];
    },
    pendingCount() {
      return this.myContents.filter((c) => c.status === "pending").length;
    },
    myLiked() {
      return this.contentStore ? this.contentStore.myLiked() : [];
    },
    myFavorited() {
      return this.contentStore ? this.contentStore.myFavorited() : [];
    },
    myShared() {
      return this.contentStore ? this.contentStore.myShared() : [];
    },
    auditCount() {
      return this.contentStore ? this.contentStore.pendingContents.length + this.contentStore.pendingComments.length : 0;
    }
  },
  created() {
    this.contentStore = store_content.useContentStore();
    this.userStore = store_user.useUserStore();
  },
  onLoad() {
    this.contentStore = store_content.useContentStore();
    this.userStore = store_user.useUserStore();
    this.contentStore.init();
    if (!this.userStore.user)
      this.userStore.login();
  },
  onShow() {
    if (!this.contentStore) {
      this.contentStore = store_content.useContentStore();
      this.userStore = store_user.useUserStore();
    }
    this.contentStore.init();
    this.greet = common_format.greeting();
  },
  methods: {
    goEditProfile() {
      common_vendor.index.navigateTo({ url: "/pages/mine/profile-edit" });
    },
    goRecords(tab = -1) {
      common_vendor.index.navigateTo({
        url: "/pages/mine/records" + (tab >= 0 ? "?tab=" + tab : "")
      });
    },
    goLikes() {
      common_vendor.index.navigateTo({ url: "/pages/mine/likes" });
    },
    goFavorites() {
      common_vendor.index.navigateTo({ url: "/pages/mine/favorites" });
    },
    goShares() {
      common_vendor.index.navigateTo({ url: "/pages/mine/shares" });
    },
    goAudit() {
      common_vendor.index.navigateTo({ url: "/pages/admin/audit" });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $options.user.avatar
  }, $options.user.avatar ? {
    b: $options.user.avatar
  } : {
    c: common_vendor.t($options.nickname.slice(0, 1))
  }, {
    d: $options.avatarBg,
    e: common_vendor.t($options.nickname),
    f: common_vendor.t($options.user.role === "admin" ? "掌柜" : "书友"),
    g: common_vendor.t($options.user.sign || "这个人很懒，什么都没写。"),
    h: $options.user.location
  }, $options.user.location ? {
    i: common_vendor.t($options.user.location)
  } : {}, {
    j: common_vendor.o((...args) => $options.goEditProfile && $options.goEditProfile(...args), "23"),
    k: common_vendor.t($options.myContents.length),
    l: common_vendor.o((...args) => $options.goRecords && $options.goRecords(...args), "c5"),
    m: common_vendor.t($options.myLiked.length),
    n: common_vendor.o((...args) => $options.goLikes && $options.goLikes(...args), "01"),
    o: common_vendor.t($options.myFavorited.length),
    p: common_vendor.o((...args) => $options.goFavorites && $options.goFavorites(...args), "d2"),
    q: common_vendor.t($options.myShared.length),
    r: common_vendor.o((...args) => $options.goShares && $options.goShares(...args), "b8"),
    s: $options.pendingCount
  }, $options.pendingCount ? {
    t: common_vendor.t($options.pendingCount)
  } : {}, {
    v: common_vendor.o((...args) => $options.goRecords && $options.goRecords(...args), "86"),
    w: common_vendor.t($options.myLiked.length),
    x: common_vendor.o((...args) => $options.goLikes && $options.goLikes(...args), "aa"),
    y: common_vendor.t($options.myFavorited.length),
    z: common_vendor.o((...args) => $options.goFavorites && $options.goFavorites(...args), "27"),
    A: common_vendor.t($options.myShared.length),
    B: common_vendor.o((...args) => $options.goShares && $options.goShares(...args), "5a"),
    C: $options.isAdmin
  }, $options.isAdmin ? common_vendor.e({
    D: $options.auditCount
  }, $options.auditCount ? {
    E: common_vendor.t($options.auditCount)
  } : {}, {
    F: common_vendor.o((...args) => $options.goAudit && $options.goAudit(...args), "e3")
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ca643e16"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/tabBar/mine/mine.js.map
