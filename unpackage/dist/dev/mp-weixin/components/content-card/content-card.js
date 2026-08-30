"use strict";
const common_vendor = require("../../common/vendor.js");
const store_content = require("../../store/content.js");
const store_user = require("../../store/user.js");
const common_format = require("../../common/format.js");
const AVATAR_COLORS = ["#07C160", "#576B95", "#E6A23C", "#5B8FF9", "#9254DE", "#FF7A45"];
function hashId(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++)
    h = (h * 31 + id.charCodeAt(i)) % 997;
  return h;
}
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
    user() {
      return this.contentStore.getUser(this.content.userId);
    },
    nickname() {
      return this.user.nickname;
    },
    avatarBg() {
      return AVATAR_COLORS[hashId(this.content.userId) % AVATAR_COLORS.length];
    },
    timeText() {
      return common_format.formatTime(this.content.createTime);
    },
    isMine() {
      return this.userStore.user && this.content.userId === this.userStore.user.id;
    },
    liked() {
      return this.me && this.content.likes.indexOf(this.me.id) > -1;
    },
    favorited() {
      return this.me && this.content.favs.indexOf(this.me.id) > -1;
    },
    me() {
      return this.userStore.user;
    },
    allComments() {
      return this.contentStore.getCommentsOf(this.content.id).filter((c) => c.status === "approved");
    },
    approvedComments() {
      return this.allComments;
    },
    showComments() {
      return this.inDetail ? this.allComments : this.allComments.slice(0, 3);
    }
  },
  created() {
    this.contentStore = store_content.useContentStore();
    this.userStore = store_user.useUserStore();
  },
  beforeUnmount() {
    if (this.innerAudio) {
      this.innerAudio.destroy();
      this.innerAudio = null;
    }
  },
  methods: {
    avatarColor(uid) {
      return AVATAR_COLORS[hashId(uid) % AVATAR_COLORS.length];
    },
    likerName(uid) {
      return this.contentStore.getUser(uid).nickname;
    },
    cmName(uid) {
      return this.contentStore.getUser(uid).nickname;
    },
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
        urls: this.content.images
      });
    },
    like() {
      this.contentStore.toggleLike(this.content.id);
    },
    favorite() {
      this.contentStore.toggleFav(this.content.id);
    },
    comment() {
      this.goDetail();
    },
    share() {
      this.contentStore.recordShare(this.content.id);
      const c = this.content;
      const text = "「" + (c.text ? c.text.slice(0, 30) : "贤书·置换") + "」 来自 贤书·置换";
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
      const v = this.content.voice;
      if (!v || !v.duration)
        return;
      if (!v.path) {
        common_vendor.index.showToast({ title: "演示数据暂无音频", icon: "none" });
        return;
      }
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
      this.innerAudio.src = v.path;
      this.innerAudio.play();
      this.playing = true;
    },
    showMap() {
      if (!this.content.location)
        return;
      common_vendor.index.openLocation({
        latitude: this.content.location.lat || 30.27,
        longitude: this.content.location.lng || 120.15,
        name: this.content.location.name,
        address: this.content.location.address || ""
      });
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
    f: $options.isMine
  }, $options.isMine ? {} : {}, {
    g: common_vendor.t($options.timeText),
    h: $props.content.location
  }, $props.content.location ? {
    i: common_vendor.t($props.content.location.name)
  } : {}, {
    j: $props.content.text
  }, $props.content.text ? common_vendor.e({
    k: common_vendor.t($props.content.text),
    l: !$data.expanded && $props.content.text.length > 90
  }, !$data.expanded && $props.content.text.length > 90 ? {
    m: common_vendor.o(($event) => $data.expanded = true, "47")
  } : {}, {
    n: !$data.expanded && $props.content.text.length > 90 ? 1 : ""
  }) : {}, {
    o: $props.content.images && $props.content.images.length
  }, $props.content.images && $props.content.images.length ? {
    p: common_vendor.f($props.content.images, (img, i, i0) => {
      return {
        a: img,
        b: i,
        c: common_vendor.o(($event) => $options.preview(i), i)
      };
    }),
    q: $props.content.images.length === 1 ? 1 : "",
    r: $props.content.images.length === 2 ? 1 : "",
    s: common_vendor.n("grid-n" + $props.content.images.length)
  } : {}, {
    t: $props.content.voice && $props.content.voice.duration
  }, $props.content.voice && $props.content.voice.duration ? {
    v: common_vendor.n($data.playing ? "bar-on" : ""),
    w: common_vendor.n($data.playing ? "bar-on" : ""),
    x: common_vendor.n($data.playing ? "bar-on" : ""),
    y: common_vendor.n($data.playing ? "bar-on" : ""),
    z: common_vendor.t($data.playing ? "播放中…" : "语音 · " + $props.content.voice.duration + "″"),
    A: common_vendor.o((...args) => $options.toggleVoice && $options.toggleVoice(...args), "b2")
  } : {}, {
    B: $props.content.location
  }, $props.content.location ? common_vendor.e({
    C: common_vendor.t($props.content.location.name),
    D: $props.content.location.address
  }, $props.content.location.address ? {
    E: common_vendor.t($props.content.location.address)
  } : {}, {
    F: common_vendor.o((...args) => $options.showMap && $options.showMap(...args), "54")
  }) : {}, {
    G: $props.content.likes && $props.content.likes.length
  }, $props.content.likes && $props.content.likes.length ? {
    H: common_vendor.f($props.content.likes.slice(0, 8), (uid, k0, i0) => {
      return {
        a: common_vendor.t($options.likerName(uid).slice(0, 1)),
        b: uid,
        c: $options.avatarColor(uid)
      };
    }),
    I: common_vendor.t($props.content.likes.length)
  } : {}, {
    J: common_vendor.t($options.liked ? "♥" : "♡"),
    K: common_vendor.t($options.liked ? "已赞" : "点赞"),
    L: $props.content.likes.length
  }, $props.content.likes.length ? {
    M: common_vendor.t($props.content.likes.length)
  } : {}, {
    N: $options.liked ? 1 : "",
    O: common_vendor.o((...args) => $options.like && $options.like(...args), "20"),
    P: $options.approvedComments.length
  }, $options.approvedComments.length ? {
    Q: common_vendor.t($options.approvedComments.length)
  } : {}, {
    R: common_vendor.o((...args) => $options.comment && $options.comment(...args), "97"),
    S: common_vendor.t($options.favorited ? "★" : "☆"),
    T: common_vendor.t($options.favorited ? "已藏" : "收藏"),
    U: $options.favorited ? 1 : "",
    V: common_vendor.o((...args) => $options.favorite && $options.favorite(...args), "29"),
    W: common_vendor.o((...args) => $options.share && $options.share(...args), "5b"),
    X: $options.approvedComments.length
  }, $options.approvedComments.length ? common_vendor.e({
    Y: common_vendor.f($options.showComments, (cm, k0, i0) => {
      return {
        a: common_vendor.t($options.cmName(cm.userId)),
        b: common_vendor.t(cm.text),
        c: cm.id,
        d: common_vendor.o((...args) => $options.goDetail && $options.goDetail(...args), cm.id)
      };
    }),
    Z: $options.approvedComments.length > 3 && !$props.inDetail
  }, $options.approvedComments.length > 3 && !$props.inDetail ? {
    aa: common_vendor.t($options.approvedComments.length),
    ab: common_vendor.o((...args) => $options.goDetail && $options.goDetail(...args), "71")
  } : {}) : {}, {
    ac: common_vendor.o((...args) => $options.goDetail && $options.goDetail(...args), "3d")
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2ce30bd0"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/content-card/content-card.js.map
