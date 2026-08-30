"use strict";
const common_vendor = require("../../common/vendor.js");
const store_content = require("../../store/content.js");
const store_user = require("../../store/user.js");
const common_format = require("../../common/format.js");
const contentCard = () => "../../components/content-card/content-card.js";
const AVATAR_COLORS = ["#07C160", "#576B95", "#E6A23C", "#5B8FF9", "#9254DE", "#FF7A45"];
const _sfc_main = {
  components: {
    contentCard
  },
  data() {
    return {
      id: "",
      content: null,
      commentText: ""
    };
  },
  computed: {
    allComments() {
      if (!this.content || !this.contentStore)
        return [];
      return this.contentStore.getCommentsOf(this.content.id);
    },
    approvedComments() {
      return this.allComments.filter((c) => c.status === "approved");
    },
    approvedCount() {
      return this.approvedComments.length;
    }
  },
  created() {
    this.contentStore = store_content.useContentStore();
    this.userStore = store_user.useUserStore();
  },
  onLoad(options) {
    this.contentStore = store_content.useContentStore();
    this.userStore = store_user.useUserStore();
    this.contentStore.init();
    this.id = options.id || "";
    this.content = this.contentStore.getContent(this.id);
  },
  methods: {
    avatarColor(uid) {
      let h = 0;
      for (let i = 0; i < uid.length; i++)
        h = (h * 31 + uid.charCodeAt(i)) % 997;
      return AVATAR_COLORS[h % AVATAR_COLORS.length];
    },
    cmName(uid) {
      return this.contentStore.getUser(uid).nickname;
    },
    formatTime(ts) {
      return common_format.formatTime(ts);
    },
    sendComment() {
      const text = this.commentText.trim();
      if (!text)
        return;
      this.contentStore.addComment(this.content.id, text);
      this.commentText = "";
      if (common_vendor.index.hideKeyboard)
        common_vendor.index.hideKeyboard();
      common_vendor.index.showToast({ title: "评论已提交，待审核", icon: "none" });
    }
  }
};
if (!Array) {
  const _easycom_content_card2 = common_vendor.resolveComponent("content-card");
  _easycom_content_card2();
}
const _easycom_content_card = () => "../../components/content-card/content-card.js";
if (!Math) {
  _easycom_content_card();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.content
  }, $data.content ? common_vendor.e({
    b: common_vendor.p({
      content: $data.content,
      ["in-detail"]: true
    }),
    c: common_vendor.t($options.approvedCount),
    d: $options.approvedComments.length
  }, $options.approvedComments.length ? {
    e: common_vendor.f($options.approvedComments, (cm, k0, i0) => {
      return {
        a: common_vendor.t($options.cmName(cm.userId).slice(0, 1)),
        b: $options.avatarColor(cm.userId),
        c: common_vendor.t($options.cmName(cm.userId)),
        d: common_vendor.t(cm.text),
        e: common_vendor.t($options.formatTime(cm.createTime)),
        f: cm.id
      };
    })
  } : {}) : {}, {
    f: common_vendor.o((...args) => $options.sendComment && $options.sendComment(...args), "2b"),
    g: $data.commentText,
    h: common_vendor.o(($event) => $data.commentText = $event.detail.value, "21"),
    i: !$data.commentText.trim() ? 1 : "",
    j: common_vendor.o((...args) => $options.sendComment && $options.sendComment(...args), "30")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-eca06f3c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/detail/detail.js.map
