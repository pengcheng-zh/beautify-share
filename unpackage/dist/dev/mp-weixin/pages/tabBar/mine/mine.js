"use strict";
const common_vendor = require("../../../common/vendor.js");
const store_content = require("../../../store/content.js");
const store_user = require("../../../store/user.js");
const common_api = require("../../../common/api.js");
const common_format = require("../../../common/format.js");
const _sfc_main = {
  data() {
    return {
      greet: "",
      // /post/mine-summary 拿到的计数，默认 0
      summary: {
        postCount: 0,
        likeCount: 0,
        favoriteCount: 0,
        shareCount: 0
      }
    };
  },
  computed: {
    // store 做成 computed：useUserStore()/useContentStore() 返回同一个单例，
    // 任何时刻都不为空，且后续依赖能正常收集、自动响应更新
    userStore() {
      return store_user.useUserStore();
    },
    contentStore() {
      return store_content.useContentStore();
    },
    user() {
      return this.userStore.user || {};
    },
    nickname() {
      return this.user.username || this.user.nickname || "书友";
    },
    avatarBg() {
      const colors = ["#07C160", "#576B95", "#E6A23C", "#5B8FF9"];
      let h = 0;
      const id = String(this.user.userId || this.user.id || "u1");
      for (let i = 0; i < id.length; i++)
        h = (h * 31 + id.charCodeAt(i)) % 997;
      return colors[h % colors.length];
    },
    isAdmin() {
      return this.user.roleId == 1;
    },
    // 「待审发布」仍走 contentStore（管理端待审总数需要全量列表）
    myContents() {
      return this.contentStore.myContents();
    },
    pendingCount() {
      return this.myContents.filter((c) => c.status === "pending").length;
    },
    auditCount() {
      return this.contentStore.pendingContents.length + this.contentStore.pendingComments.length;
    }
  },
  async onLoad() {
    this.userStore.refreshMe();
    this.loadSummary();
  },
  onShow() {
    this.loadSummary();
    this.greet = common_format.greeting();
  },
  methods: {
    async loadSummary() {
      try {
        const data = await common_api.postApi.mineSummary();
        if (data && typeof data === "object") {
          this.summary = {
            postCount: Number(data.postCount) || 0,
            likeCount: Number(data.likeCount) || 0,
            favoriteCount: Number(data.favoriteCount) || 0,
            shareCount: Number(data.shareCount) || 0
          };
        }
      } catch (e) {
        common_vendor.index.__f__("warn", "at pages/tabBar/mine/mine.vue:170", "[mine] loadSummary failed", e);
      }
    },
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
    f: common_vendor.t($options.isAdmin ? "掌柜" : "书友"),
    g: common_vendor.t($options.user.sign || "这个人很懒，什么都没写。"),
    h: $options.user.location
  }, $options.user.location ? {
    i: common_vendor.t($options.user.location)
  } : {}, {
    j: common_vendor.o((...args) => $options.goEditProfile && $options.goEditProfile(...args), "23"),
    k: common_vendor.t($data.summary.postCount),
    l: common_vendor.o((...args) => $options.goRecords && $options.goRecords(...args), "e7"),
    m: common_vendor.t($data.summary.likeCount),
    n: common_vendor.o((...args) => $options.goLikes && $options.goLikes(...args), "bd"),
    o: common_vendor.t($data.summary.favoriteCount),
    p: common_vendor.o((...args) => $options.goFavorites && $options.goFavorites(...args), "4b"),
    q: common_vendor.t($data.summary.shareCount),
    r: common_vendor.o((...args) => $options.goShares && $options.goShares(...args), "1d"),
    s: $options.pendingCount
  }, $options.pendingCount ? {
    t: common_vendor.t($options.pendingCount)
  } : {}, {
    v: common_vendor.o((...args) => $options.goRecords && $options.goRecords(...args), "5c"),
    w: common_vendor.t($data.summary.likeCount),
    x: common_vendor.o((...args) => $options.goLikes && $options.goLikes(...args), "f3"),
    y: common_vendor.t($data.summary.favoriteCount),
    z: common_vendor.o((...args) => $options.goFavorites && $options.goFavorites(...args), "48"),
    A: common_vendor.t($data.summary.shareCount),
    B: common_vendor.o((...args) => $options.goShares && $options.goShares(...args), "57"),
    C: $options.isAdmin
  }, $options.isAdmin ? common_vendor.e({
    D: $options.auditCount
  }, $options.auditCount ? {
    E: common_vendor.t($options.auditCount)
  } : {}, {
    F: common_vendor.o((...args) => $options.goAudit && $options.goAudit(...args), "79")
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ca643e16"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/tabBar/mine/mine.js.map
