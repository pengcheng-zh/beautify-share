"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api = require("../../common/api.js");
const common_format = require("../../common/format.js");
const AVATAR_COLORS = ["#07C160", "#576B95", "#E6A23C", "#5B8FF9", "#9254DE", "#FF7A45"];
const _sfc_main = {
  data() {
    return {
      tab: 0,
      // 三个 tab 各自实时拉取，不在本地做状态过滤
      pendingContents: [],
      pendingComments: [],
      // 当前正在播放的语音 id（用 data 集中管理，避免逐条记录状态）
      playingId: null,
      innerAudio: null
    };
  },
  onLoad(options) {
    this.tab = Number(options.tab || 0);
    this.loadCurrent();
  },
  onShow() {
    this.loadCurrent();
  },
  onUnload() {
    this._destroyAudio();
  },
  methods: {
    // 切换 tab：实时请求当前 tab 对应的接口
    switchTab(i) {
      if (this.tab === i)
        return;
      this.tab = i;
      this.loadCurrent();
    },
    loadCurrent() {
      if (this.tab === 0) {
        this.loadPendingContents();
      } else if (this.tab === 1) {
        this.loadPendingComments();
      } else {
        this.loadHandled();
      }
    },
    // 待审内容：GET /admin/post/list
    async loadPendingContents() {
      try {
        const res = await common_api.adminApi.postList({ page: 1, pageSize: 50 });
        this.pendingContents = res && res.data || res.data || [];
        common_vendor.index.__f__("log", "at pages/admin/audit.vue:135", "[audit] loadPendingContents", this.pendingContents);
      } catch (e) {
        common_vendor.index.__f__("warn", "at pages/admin/audit.vue:137", "[audit] loadPendingContents failed", e);
      }
    },
    // 待审评论：GET /admin/comment/list
    async loadPendingComments() {
      try {
        const res = await common_api.adminApi.commentList({ page: 1, pageSize: 50 });
        this.pendingComments = res && res.data || res.data || [];
      } catch (e) {
        common_vendor.index.__f__("warn", "at pages/admin/audit.vue:146", "[audit] loadPendingComments failed", e);
      }
    },
    nick(item) {
      return item.username || "书友";
    },
    avatarColor(uid) {
      let h = 0;
      const s = String(uid);
      for (let i = 0; i < s.length; i++)
        h = (h * 31 + s.charCodeAt(i)) % 997;
      return AVATAR_COLORS[h % AVATAR_COLORS.length];
    },
    formatTime(ts) {
      return common_format.formatTime(ts);
    },
    contentBrief(postId) {
      const pool = this.pendingContents;
      const found = pool.find((c) => String(c.id) === String(postId));
      if (found && found.text) {
        return found.text.length > 10 ? found.text.slice(0, 10) + "…" : found.text;
      }
      return "已删";
    },
    /**
     * 语音播放/停止：单例 InnerAudioContext，playingId 记录当前正在播放的条目
     */
    toggleVoice(c) {
      if (!c || !c.voice)
        return;
      if (this.playingId === c.id) {
        this._stopAudio();
        return;
      }
      this._stopAudio();
      if (!this.innerAudio) {
        this.innerAudio = common_vendor.index.createInnerAudioContext();
        this.innerAudio.onEnded(() => {
          this.playingId = null;
        });
        this.innerAudio.onStop(() => {
          this.playingId = null;
        });
        this.innerAudio.onError((err) => {
          common_vendor.index.__f__("warn", "at pages/admin/audit.vue:186", "[audit] voice play error", err);
          this.playingId = null;
        });
      }
      this.innerAudio.src = c.voice;
      this.innerAudio.play();
      this.playingId = c.id;
    },
    _stopAudio() {
      if (this.innerAudio) {
        try {
          this.innerAudio.stop();
        } catch (e) {
        }
      }
      this.playingId = null;
    },
    _destroyAudio() {
      if (this.innerAudio) {
        try {
          this.innerAudio.destroy();
        } catch (e) {
        }
        this.innerAudio = null;
      }
      this.playingId = null;
    },
    // 书帖审核：P=通过, R=驳回，成功后刷新实时列表
    async passContent(c) {
      await this.auditPost(c, "P");
    },
    async rejectContent(c) {
      const reason = await this.askReason();
      if (reason === null)
        return;
      await this.auditPost(c, "R", reason);
    },
    async auditPost(c, status, reason) {
      if (!c)
        return;
      try {
        await common_api.adminApi.postAudit({ id: c.id, status, reason });
        common_vendor.index.showToast({ title: status === "P" ? "已通过" : "已驳回", icon: "success" });
        if (this.playingId === c.id)
          this._stopAudio();
        this.loadPendingContents();
      } catch (e) {
        common_vendor.index.showToast({ title: e && e.message || "操作失败", icon: "none" });
      }
    },
    // 评论审核：P=通过, R=驳回，成功后刷新实时列表
    async passComment(cm) {
      await this.auditComment(cm, "P");
    },
    async rejectComment(cm) {
      const reason = await this.askReason();
      if (reason === null)
        return;
      await this.auditComment(cm, "R", reason);
    },
    async auditComment(cm, status, reason) {
      if (!cm)
        return;
      try {
        await common_api.adminApi.commentAudit({ id: cm.id, status, reason });
        common_vendor.index.showToast({ title: status === "P" ? "已通过" : "已驳回", icon: "success" });
        this.loadPendingComments();
      } catch (e) {
        common_vendor.index.showToast({ title: e && e.message || "操作失败", icon: "none" });
      }
    },
    // 驳回原因输入弹窗：取消返回 null，确认返回输入内容（可为空串）
    askReason() {
      return new Promise((resolve) => {
        common_vendor.index.showModal({
          title: "填写驳回原因",
          editable: true,
          placeholderText: "驳回原因（可选）",
          success: (res) => resolve(res.confirm ? res.content || "" : null),
          fail: () => resolve(null)
        });
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.pendingContents.length
  }, $data.pendingContents.length ? {
    b: common_vendor.t($data.pendingContents.length)
  } : {}, {
    c: $data.tab === 0 ? 1 : "",
    d: common_vendor.o(($event) => $options.switchTab(0), "20"),
    e: $data.pendingComments.length
  }, $data.pendingComments.length ? {
    f: common_vendor.t($data.pendingComments.length)
  } : {}, {
    g: $data.tab === 1 ? 1 : "",
    h: common_vendor.o(($event) => $options.switchTab(1), "1f"),
    i: $data.tab === 0
  }, $data.tab === 0 ? common_vendor.e({
    j: common_vendor.f($data.pendingContents, (c, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t($options.nick(c).slice(0, 1)),
        b: $options.avatarColor(c.userId),
        c: common_vendor.t($options.nick(c)),
        d: common_vendor.t($options.formatTime(c.createTime)),
        e: c.content
      }, c.content ? {
        f: common_vendor.t(c.content)
      } : {}, {
        g: c.pictures && c.pictures.length
      }, c.pictures && c.pictures.length ? {
        h: common_vendor.f(c.pictures, (img, k, i1) => {
          return {
            a: k,
            b: img
          };
        })
      } : {}, {
        i: c.voice
      }, c.voice ? {
        j: $data.playingId === c.id ? 1 : "",
        k: $data.playingId === c.id ? 1 : "",
        l: $data.playingId === c.id ? 1 : "",
        m: $data.playingId === c.id ? 1 : "",
        n: common_vendor.t($data.playingId === c.id ? "播放中…" : "收听语音"),
        o: common_vendor.o(($event) => $options.toggleVoice(c), c.id)
      } : {}, {
        p: c.pictures && c.pictures.length
      }, c.pictures && c.pictures.length ? {
        q: common_vendor.t(c.pictures.length)
      } : {}, {
        r: c.voice
      }, c.voice ? {} : {}, {
        s: c.location
      }, c.location ? {
        t: common_vendor.t(c.location.name)
      } : {}, {
        v: common_vendor.o(($event) => $options.passContent(c), c.id),
        w: common_vendor.o(($event) => $options.rejectContent(c), c.id),
        x: c.id
      });
    }),
    k: !$data.pendingContents.length
  }, !$data.pendingContents.length ? {} : {}) : {}, {
    l: $data.tab === 1
  }, $data.tab === 1 ? common_vendor.e({
    m: common_vendor.f($data.pendingComments, (cm, k0, i0) => {
      return {
        a: common_vendor.t($options.contentBrief(cm.postId)),
        b: common_vendor.t($options.nick(cm).slice(0, 1)),
        c: $options.avatarColor(cm.userId),
        d: common_vendor.t($options.nick(cm)),
        e: common_vendor.t($options.formatTime(cm.createTime)),
        f: common_vendor.t(cm.text),
        g: common_vendor.o(($event) => $options.passComment(cm), cm.id),
        h: common_vendor.o(($event) => $options.rejectComment(cm), cm.id),
        i: cm.id
      };
    }),
    n: !$data.pendingComments.length
  }, !$data.pendingComments.length ? {} : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-490f35cd"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/admin/audit.js.map
