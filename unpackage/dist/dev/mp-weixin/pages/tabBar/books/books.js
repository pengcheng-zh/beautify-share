"use strict";
const common_vendor = require("../../../common/vendor.js");
const store_content = require("../../../store/content.js");
const contentCard = () => "../../../components/content-card/content-card.js";
const _sfc_main = {
  components: {
    contentCard
  },
  data() {
    return {
      list: []
    };
  },
  onLoad() {
    this.contentStore = store_content.useContentStore();
    this.contentStore.init();
    this.refresh();
  },
  onShow() {
    if (this.contentStore) {
      this.contentStore.init();
      this.refresh();
    }
  },
  onPullDownRefresh() {
    this.contentStore.init();
    this.refresh();
    setTimeout(() => {
      common_vendor.index.stopPullDownRefresh();
      common_vendor.index.showToast({ title: "市集已刷新", icon: "none" });
    }, 400);
  },
  onShareAppMessage() {
    return {
      title: "贤书·置换｜人间烟火，书市清灵",
      path: "/pages/tabBar/books/books"
    };
  },
  methods: {
    refresh() {
      this.list = this.contentStore.approvedContents;
    },
    goPublish() {
      common_vendor.index.navigateTo({
        url: "/pages/publish/publish"
      });
    }
  }
};
if (!Array) {
  const _easycom_content_card2 = common_vendor.resolveComponent("content-card");
  _easycom_content_card2();
}
const _easycom_content_card = () => "../../../components/content-card/content-card.js";
if (!Math) {
  _easycom_content_card();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.list.length
  }, $data.list.length ? {
    b: common_vendor.f($data.list, (c, k0, i0) => {
      return {
        a: c.id,
        b: "9d4f95ad-0-" + i0,
        c: common_vendor.p({
          content: c
        })
      };
    })
  } : {}, {
    c: common_vendor.o((...args) => $options.goPublish && $options.goPublish(...args), "35")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9d4f95ad"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/tabBar/books/books.js.map
