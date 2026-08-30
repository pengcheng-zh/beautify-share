"use strict";
const common_vendor = require("../../common/vendor.js");
const store_content = require("../../store/content.js");
const common_format = require("../../common/format.js");
const AVATAR_COLORS = ["#07C160", "#576B95", "#E6A23C", "#5B8FF9", "#9254DE", "#FF7A45"];
const _sfc_main = {
  data() {
    return {
      tab: 0
    };
  },
  computed: {
    pendingContents() {
      return this._store ? this._store.pendingContents : [];
    },
    pendingComments() {
      return this._store ? this._store.pendingComments : [];
    },
    handledContents() {
      return this._store ? this._store.contents.filter((c) => c.status === "approved" || c.status === "rejected").sort((a, b) => b.createTime - a.createTime) : [];
    },
    handledComments() {
      return this._store ? this._store.comments.filter((c) => c.status === "approved" || c.status === "rejected").sort((a, b) => b.createTime - a.createTime) : [];
    }
  },
  created() {
    this._store = store_content.useContentStore();
  },
  onLoad() {
    this._store = store_content.useContentStore();
    this._store.init();
  },
  methods: {
    avatarColor(uid) {
      let h = 0;
      for (let i = 0; i < uid.length; i++)
        h = (h * 31 + uid.charCodeAt(i)) % 997;
      return AVATAR_COLORS[h % AVATAR_COLORS.length];
    },
    userName(uid) {
      return this._store.getUser(uid).nickname;
    },
    formatTime(ts) {
      return common_format.formatTime(ts);
    },
    contentBrief(id) {
      const c = this._store.getContent(id);
      if (!c)
        return "已删";
      return c.text ? c.text.slice(0, 18) + (c.text.length > 18 ? "…" : "") : "无文字";
    },
    passContent(c) {
      this._store.auditContent(c.id, "approved");
      common_vendor.index.showToast({ title: "已通过，可在书斋示人", icon: "none" });
    },
    rejectContent(c) {
      this._store.auditContent(c.id, "rejected");
      common_vendor.index.showToast({ title: "已驳回", icon: "none" });
    },
    passComment(cm) {
      this._store.auditComment(cm.id, "approved");
      common_vendor.index.showToast({ title: "评论已通过", icon: "none" });
    },
    rejectComment(cm) {
      this._store.auditComment(cm.id, "rejected");
      common_vendor.index.showToast({ title: "评论已驳回", icon: "none" });
    },
    restoreContent(c) {
      this._store.auditContent(c.id, "pending");
      common_vendor.index.showToast({ title: "已移回待审", icon: "none" });
    },
    restoreComment(cm) {
      this._store.auditComment(cm.id, "pending");
      common_vendor.index.showToast({ title: "已移回待审", icon: "none" });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $options.pendingContents.length
  }, $options.pendingContents.length ? {
    b: common_vendor.t($options.pendingContents.length)
  } : {}, {
    c: $data.tab === 0 ? 1 : "",
    d: common_vendor.o(($event) => $data.tab = 0, "59"),
    e: $options.pendingComments.length
  }, $options.pendingComments.length ? {
    f: common_vendor.t($options.pendingComments.length)
  } : {}, {
    g: $data.tab === 1 ? 1 : "",
    h: common_vendor.o(($event) => $data.tab = 1, "be"),
    i: $data.tab === 2 ? 1 : "",
    j: common_vendor.o(($event) => $data.tab = 2, "05"),
    k: $data.tab === 0
  }, $data.tab === 0 ? common_vendor.e({
    l: common_vendor.f($options.pendingContents, (c, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t($options.userName(c.userId).slice(0, 1)),
        b: $options.avatarColor(c.userId),
        c: common_vendor.t($options.userName(c.userId)),
        d: common_vendor.t($options.formatTime(c.createTime)),
        e: c.text
      }, c.text ? {
        f: common_vendor.t(c.text)
      } : {}, {
        g: c.images && c.images.length
      }, c.images && c.images.length ? common_vendor.e({
        h: common_vendor.f(c.images.slice(0, 3), (img, k, i1) => {
          return {
            a: k,
            b: img
          };
        }),
        i: c.images.length > 3
      }, c.images.length > 3 ? {
        j: common_vendor.t(c.images.length - 3)
      } : {}) : {}, {
        k: c.images.length
      }, c.images.length ? {
        l: common_vendor.t(c.images.length)
      } : {}, {
        m: c.voice && c.voice.duration
      }, c.voice && c.voice.duration ? {
        n: common_vendor.t(c.voice.duration)
      } : {}, {
        o: c.location
      }, c.location ? {
        p: common_vendor.t(c.location.name)
      } : {}, {
        q: common_vendor.o(($event) => $options.passContent(c), c.id),
        r: common_vendor.o(($event) => $options.rejectContent(c), c.id),
        s: c.id
      });
    }),
    m: !$options.pendingContents.length
  }, !$options.pendingContents.length ? {} : {}) : {}, {
    n: $data.tab === 1
  }, $data.tab === 1 ? common_vendor.e({
    o: common_vendor.f($options.pendingComments, (cm, k0, i0) => {
      return {
        a: common_vendor.t($options.contentBrief(cm.contentId)),
        b: common_vendor.t($options.userName(cm.userId).slice(0, 1)),
        c: $options.avatarColor(cm.userId),
        d: common_vendor.t($options.userName(cm.userId)),
        e: common_vendor.t($options.formatTime(cm.createTime)),
        f: common_vendor.t(cm.text),
        g: common_vendor.o(($event) => $options.passComment(cm), cm.id),
        h: common_vendor.o(($event) => $options.rejectComment(cm), cm.id),
        i: cm.id
      };
    }),
    p: !$options.pendingComments.length
  }, !$options.pendingComments.length ? {} : {}) : {}, {
    q: $data.tab === 2
  }, $data.tab === 2 ? common_vendor.e({
    r: common_vendor.f($options.handledContents, (c, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t($options.userName(c.userId).slice(0, 1)),
        b: $options.avatarColor(c.userId),
        c: common_vendor.t($options.userName(c.userId)),
        d: common_vendor.t($options.formatTime(c.createTime)),
        e: common_vendor.t(c.status === "approved" ? "已通过" : "已驳回"),
        f: common_vendor.n(c.status),
        g: c.text
      }, c.text ? {
        h: common_vendor.t(c.text)
      } : {}, {
        i: common_vendor.o(($event) => $options.restoreContent(c), "c" + c.id),
        j: "c" + c.id
      });
    }),
    s: common_vendor.f($options.handledComments, (cm, k0, i0) => {
      return {
        a: common_vendor.t($options.contentBrief(cm.contentId)),
        b: common_vendor.t($options.userName(cm.userId).slice(0, 1)),
        c: $options.avatarColor(cm.userId),
        d: common_vendor.t($options.userName(cm.userId)),
        e: common_vendor.t($options.formatTime(cm.createTime)),
        f: common_vendor.t(cm.status === "approved" ? "已通过" : "已驳回"),
        g: common_vendor.n(cm.status),
        h: common_vendor.t(cm.text),
        i: common_vendor.o(($event) => $options.restoreComment(cm), "m" + cm.id),
        j: "m" + cm.id
      };
    }),
    t: !$options.handledContents.length && !$options.handledComments.length
  }, !$options.handledContents.length && !$options.handledComments.length ? {} : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-490f35cd"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/audit.js.map
