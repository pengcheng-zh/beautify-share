"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api = require("../../common/api.js");
const store_user = require("../../store/user.js");
const common_format = require("../../common/format.js");
const _sfc_main = {
  name: "content-card",
  props: {
    content: {
      type: Object,
      required: true
    },
    inDetail: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      expanded: false,
      playing: false,
      innerAudio: null
    };
  },
  computed: {
    /* 用户信息直接来自 content，无需查 store */
    nickname() {
      return this.content.username || "无名书友";
    },
    avatarBg() {
      if (this.content.avatar)
        return "transparent";
      const key = String(this.content.userId || "");
      const colors = ["#07C160", "#576B95", "#E6A23C", "#5B8FF9", "#9254DE", "#FF7A45"];
      let h = 0;
      for (let i = 0; i < key.length; i++)
        h = (h * 31 + key.charCodeAt(i)) % 997;
      return colors[h % colors.length];
    },
    timeText() {
      return common_format.formatTime(this.content.createTime);
    },
    isMine() {
      if (!this.userStore.user)
        return false;
      const me = this.userStore.user.userId || this.userStore.user.id;
      return String(this.content.userId) === String(me);
    },
    /* 正文 */
    text() {
      return this.content.content || "";
    },
    /* 图片：后端字段 pictures */
    images() {
      return Array.isArray(this.content.pictures) ? this.content.pictures : [];
    },
    /* 语音：后端只返回 URL 字符串，无 duration/path */
    voiceUrl() {
      return this.content.voice || "";
    },
    /* 定位：后端 location 是名称字符串，latitude/longitude 独立 */
    locationName() {
      return this.content.location || "";
    },
    /* 互动计数 */
    liked() {
      return !!this.content.liked;
    },
    favorited() {
      return !!this.content.favorited;
    },
    likeCount() {
      return Number(this.content.likeCount) || 0;
    },
    favoriteCount() {
      return Number(this.content.favoriteCount) || 0;
    },
    commentCount() {
      return Number(this.content.commentCount) || 0;
    }
  },
  created() {
    this.userStore = store_user.useUserStore();
  },
  beforeUnmount() {
    if (this.innerAudio) {
      this.innerAudio.destroy();
      this.innerAudio = null;
    }
  },
  methods: {
    goDetail() {
      if (this.inDetail)
        return;
      common_vendor.index.navigateTo({
        url: "/pages/detail/detail?id=" + this.content.id
      });
    },
    preview(index) {
      common_vendor.index.previewImage({
        current: index,
        urls: this.images
      });
    },
    /**
     * 点赞：直接调接口，乐观更新传入的 content 对象
     */
    async like() {
      const c = this.content;
      const wasLiked = !!c.liked;
      c.liked = !wasLiked;
      c.likeCount = Math.max(0, (Number(c.likeCount) || 0) + (wasLiked ? -1 : 1));
      try {
        await common_api.postApi.like(c.id);
      } catch (e) {
        c.liked = wasLiked;
        c.likeCount = Math.max(0, (Number(c.likeCount) || 0) + (wasLiked ? 1 : -1));
        common_vendor.index.showToast({ title: "点赞失败，请稍后再试", icon: "none" });
      }
    },
    /**
     * 收藏：直接调接口，乐观更新传入的 content 对象
     */
    async favorite() {
      const c = this.content;
      const wasFav = !!c.favorited;
      c.favorited = !wasFav;
      c.favoriteCount = Math.max(0, (Number(c.favoriteCount) || 0) + (wasFav ? -1 : 1));
      try {
        await common_api.postApi.favorite(c.id);
      } catch (e) {
        c.favorited = wasFav;
        c.favoriteCount = Math.max(0, (Number(c.favoriteCount) || 0) + (wasFav ? 1 : -1));
        common_vendor.index.showToast({ title: "收藏失败，请稍后再试", icon: "none" });
      }
    },
    share() {
      this.content;
      const text = "「" + (this.text ? this.text.slice(0, 30) : "贤书·置换") + "」 来自 贤书·置换";
      common_vendor.index.showActionSheet({
        itemList: ["复制内容分享", "转发给书友"],
        success: (res) => {
          if (res.tapIndex === 0) {
            common_vendor.index.setClipboardData({
              data: text,
              success: () => {
                common_vendor.index.showToast({ title: "已复制，去分享吧", icon: "none" });
              }
            });
          } else {
            common_vendor.index.showToast({ title: "已记下你的分享", icon: "none" });
          }
        }
      });
    },
    toggleVoice() {
      if (!this.voiceUrl)
        return;
      if (!this.innerAudio) {
        this.innerAudio = common_vendor.index.createInnerAudioContext();
        this.innerAudio.onEnded(() => {
          this.playing = false;
        });
      }
      if (this.playing) {
        this.innerAudio.stop();
        this.playing = false;
        return;
      }
      this.innerAudio.src = this.voiceUrl;
      this.innerAudio.play();
      this.playing = true;
    },
    showMap() {
      if (!this.locationName)
        return;
      common_vendor.index.openLocation({
        latitude: Number(this.content.latitude) || 30.27,
        longitude: Number(this.content.longitude) || 120.15,
        name: this.locationName,
        address: ""
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.content.avatar
  }, $props.content.avatar ? {
    b: $props.content.avatar
  } : {
    c: common_vendor.t($options.nickname.slice(0, 1))
  }, {
    d: $options.avatarBg,
    e: common_vendor.t($options.nickname),
    f: $options.isMine
  }, $options.isMine ? {} : {}, {
    g: common_vendor.t($options.timeText),
    h: $options.locationName
  }, $options.locationName ? {
    i: common_vendor.t($options.locationName)
  } : {}, {
    j: $options.text
  }, $options.text ? common_vendor.e({
    k: common_vendor.t($options.text),
    l: !$data.expanded && $options.text.length > 90
  }, !$data.expanded && $options.text.length > 90 ? {
    m: common_vendor.o(($event) => $data.expanded = true, "d5")
  } : {}, {
    n: !$data.expanded && $options.text.length > 90 ? 1 : ""
  }) : {}, {
    o: $options.images.length
  }, $options.images.length ? {
    p: common_vendor.f($options.images, (img, i, i0) => {
      return {
        a: img,
        b: i,
        c: common_vendor.o(($event) => $options.preview(i), i)
      };
    }),
    q: $options.images.length === 1 ? 1 : "",
    r: $options.images.length === 2 ? 1 : "",
    s: common_vendor.n("grid-n" + $options.images.length)
  } : {}, {
    t: $options.voiceUrl
  }, $options.voiceUrl ? {
    v: common_vendor.n($data.playing ? "bar-on" : ""),
    w: common_vendor.n($data.playing ? "bar-on" : ""),
    x: common_vendor.n($data.playing ? "bar-on" : ""),
    y: common_vendor.n($data.playing ? "bar-on" : ""),
    z: common_vendor.t($data.playing ? "播放中…" : "语音消息"),
    A: common_vendor.o((...args) => $options.toggleVoice && $options.toggleVoice(...args), "25")
  } : {}, {
    B: $options.locationName
  }, $options.locationName ? {
    C: common_vendor.t($options.locationName),
    D: common_vendor.o((...args) => $options.showMap && $options.showMap(...args), "09")
  } : {}, {
    E: common_vendor.t($options.liked ? "♥" : "♡"),
    F: common_vendor.t($options.liked ? "已赞" : "点赞"),
    G: $options.likeCount
  }, $options.likeCount ? {
    H: common_vendor.t($options.likeCount)
  } : {}, {
    I: $options.liked ? 1 : "",
    J: common_vendor.o((...args) => $options.like && $options.like(...args), "d0"),
    K: $options.commentCount
  }, $options.commentCount ? {
    L: common_vendor.t($options.commentCount)
  } : {}, {
    M: common_vendor.o((...args) => $options.goDetail && $options.goDetail(...args), "3a"),
    N: common_vendor.t($options.favorited ? "★" : "☆"),
    O: common_vendor.t($options.favorited ? "已藏" : "收藏"),
    P: $options.favorited ? 1 : "",
    Q: common_vendor.o((...args) => $options.favorite && $options.favorite(...args), "59"),
    R: common_vendor.o((...args) => $options.share && $options.share(...args), "08"),
    S: $options.commentCount
  }, $options.commentCount ? {
    T: common_vendor.t($options.commentCount),
    U: common_vendor.o((...args) => $options.goDetail && $options.goDetail(...args), "bb")
  } : {}, {
    V: common_vendor.o((...args) => $options.goDetail && $options.goDetail(...args), "3d")
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2ce30bd0"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/content-card/content-card.js.map
