"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api = require("../../common/api.js");
const store_user = require("../../store/user.js");
const common_format = require("../../common/format.js");
const contentCard = () => "../../components/content-card/content-card.js";
const AVATAR_COLORS = ["#07C160", "#576B95", "#E6A23C", "#5B8FF9", "#9254DE", "#FF7A45"];
function normalizeComment(raw) {
  if (!raw)
    return null;
  return {
    id: raw.id,
    postId: raw.postId,
    userId: raw.userId,
    text: raw.text || raw.content || "",
    username: raw.username || raw.nickname || "",
    avatar: raw.avatar || "",
    createTime: raw.createTime
  };
}
function pickList(data) {
  if (!data)
    return [];
  if (Array.isArray(data))
    return data;
  for (const k of ["list", "records", "rows", "items", "content", "data"]) {
    if (Array.isArray(data[k]))
      return data[k];
  }
  return [];
}
const _sfc_main = {
  components: {
    contentCard
  },
  data() {
    return {
      id: "",
      content: null,
      comments: [],
      page: 1,
      pageSize: 20,
      hasMore: true,
      loading: false,
      loadingMore: false,
      sending: false,
      commentText: ""
    };
  },
  computed: {
    meId() {
      if (!this.userStore || !this.userStore.user)
        return "";
      return this.userStore.user.userId || this.userStore.user.id || "";
    }
  },
  created() {
    this.userStore = store_user.useUserStore();
  },
  async onLoad(options) {
    this.id = options.id || "";
    await this.loadDetail();
    await this.loadComments(true);
  },
  onReachBottom() {
    if (!this.content || this.loadingMore || !this.hasMore)
      return;
    this.loadComments(false);
  },
  methods: {
    async loadDetail() {
      if (!this.id)
        return;
      this.loading = true;
      try {
        const data = await common_api.postApi.detail(this.id);
        this.content = data || null;
      } catch (e) {
        common_vendor.index.__f__("warn", "at pages/detail/detail.vue:135", "[detail] loadDetail failed", e);
        this.content = null;
      } finally {
        this.loading = false;
      }
    },
    async loadComments(refresh) {
      if (refresh) {
        this.page = 1;
        this.hasMore = true;
      }
      if (!this.hasMore)
        return;
      if (refresh) {
        this.loading = true;
      } else {
        this.loadingMore = true;
      }
      try {
        const data = await common_api.commentApi.list({ postId: this.id, page: this.page, pageSize: this.pageSize });
        const arr = pickList(data).map(normalizeComment).filter(Boolean);
        if (refresh) {
          this.comments = arr;
        } else {
          this.comments = this.comments.concat(arr);
        }
        this.hasMore = arr.length >= this.pageSize;
        if (this.hasMore)
          this.page += 1;
      } catch (e) {
        common_vendor.index.__f__("warn", "at pages/detail/detail.vue:164", "[detail] loadComments failed", e);
      } finally {
        this.loading = false;
        this.loadingMore = false;
      }
    },
    avatarColor(uid, avatar) {
      if (avatar)
        return "transparent";
      const s = String(uid || "");
      let h = 0;
      for (let i = 0; i < s.length; i++)
        h = (h * 31 + s.charCodeAt(i)) % 997;
      return AVATAR_COLORS[h % AVATAR_COLORS.length];
    },
    cmName(cm) {
      return cm.username || cm.nickname || "无名书友";
    },
    formatTime(ts) {
      return common_format.formatTime(ts);
    },
    canDelete(cm) {
      return this.meId && String(cm.userId) === String(this.meId);
    },
    async sendComment() {
      const text = this.commentText.trim();
      if (!text || !this.content || this.sending)
        return;
      this.sending = true;
      try {
        await common_api.commentApi.create({ postId: this.content.id, text });
        this.commentText = "";
        if (common_vendor.index.hideKeyboard)
          common_vendor.index.hideKeyboard();
        common_vendor.index.showToast({ title: "评论已提交", icon: "none" });
        await this.loadComments(true);
        if (this.content && this.content.commentCount !== void 0) {
          this.content.commentCount = (Number(this.content.commentCount) || 0) + 1;
        }
      } catch (e) {
        common_vendor.index.showToast({ title: e && e.message || "评论失败", icon: "none" });
      } finally {
        this.sending = false;
      }
    },
    async deleteCm(cm) {
      if (!this.content)
        return;
      common_vendor.index.showModal({
        title: "删除评论",
        content: "确定要删除这条评论吗？",
        success: async (r) => {
          if (!r.confirm)
            return;
          try {
            await common_api.commentApi.delete(cm.id);
            this.comments = this.comments.filter((c) => String(c.id) !== String(cm.id));
            if (this.content && this.content.commentCount !== void 0) {
              this.content.commentCount = Math.max(0, (Number(this.content.commentCount) || 0) - 1);
            }
            common_vendor.index.showToast({ title: "已删除", icon: "none" });
          } catch (e) {
            common_vendor.index.showToast({ title: "删除失败", icon: "none" });
          }
        }
      });
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
    c: common_vendor.t($data.comments.length),
    d: $data.comments.length
  }, $data.comments.length ? common_vendor.e({
    e: common_vendor.f($data.comments, (cm, k0, i0) => {
      return common_vendor.e({
        a: cm.avatar
      }, cm.avatar ? {
        b: cm.avatar
      } : {
        c: common_vendor.t($options.cmName(cm).slice(0, 1))
      }, {
        d: $options.avatarColor(cm.userId, cm.avatar),
        e: common_vendor.t($options.cmName(cm)),
        f: $options.canDelete(cm)
      }, $options.canDelete(cm) ? {
        g: common_vendor.o(($event) => $options.deleteCm(cm), cm.id)
      } : {}, {
        h: common_vendor.t(cm.text || cm.content),
        i: common_vendor.t($options.formatTime(cm.createTime)),
        j: cm.id
      });
    }),
    f: $data.loadingMore
  }, $data.loadingMore ? {} : !$data.hasMore && $data.comments.length ? {} : {}, {
    g: !$data.hasMore && $data.comments.length
  }) : {}) : $data.loading ? {} : {}, {
    h: $data.loading,
    i: common_vendor.o((...args) => $options.sendComment && $options.sendComment(...args), "37"),
    j: $data.commentText,
    k: common_vendor.o(($event) => $data.commentText = $event.detail.value, "bd"),
    l: !$data.commentText.trim() || $data.sending ? 1 : "",
    m: common_vendor.o((...args) => $options.sendComment && $options.sendComment(...args), "ce")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-eca06f3c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/detail/detail.js.map
