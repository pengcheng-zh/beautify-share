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
      loading: false
    };
  },
  computed: {
    contentStore() {
      return this._store;
    },
    list() {
      return this._store ? this._store.feed : [];
    },
    finished() {
      return this._store ? !this._store.feedHasMore : true;
    }
  },
  created() {
    this._store = store_content.useContentStore();
  },
  onLoad() {
    this._store = store_content.useContentStore();
    this.loadFirst();
  },
  onShow() {
    if (!this._store) {
      this._store = store_content.useContentStore();
    }
    this.refresh();
  },
  async onPullDownRefresh() {
    try {
      await this._store.refreshFeed();
      common_vendor.index.showToast({ title: "市集已刷新", icon: "none" });
    } finally {
      common_vendor.index.stopPullDownRefresh();
    }
  },
  onReachBottom() {
    if (this.loading || this.finished)
      return;
    this.loadMore();
  },
  onShareAppMessage() {
    return {
      title: "贤书·置换｜人间烟火，书市清灵",
      path: "/pages/tabBar/books/books"
    };
  },
  methods: {
    async loadFirst() {
      if (this.list.length)
        return;
      this.loading = true;
      try {
        await this._store.loadFeed({ page: 1, refresh: true });
      } finally {
        this.loading = false;
      }
    },
    async refresh() {
      if (this.loading)
        return;
      this.loading = true;
      try {
        await this._store.refreshFeed();
      } finally {
        this.loading = false;
      }
    },
    async loadMore() {
      if (this.loading || this.finished)
        return;
      this.loading = true;
      try {
        await this._store.loadFeed({ page: this._store.feedPage + 1 });
      } finally {
        this.loading = false;
      }
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
    a: $options.list.length
  }, $options.list.length ? common_vendor.e({
    b: common_vendor.f($options.list, (c, k0, i0) => {
      return {
        a: c.id,
        b: "9d4f95ad-0-" + i0,
        c: common_vendor.p({
          content: c
        })
      };
    }),
    c: $data.loading
  }, $data.loading ? {} : $options.finished ? {} : {
    e: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args), "9f")
  }, {
    d: $options.finished
  }) : $data.loading ? {} : {}, {
    f: $data.loading,
    g: common_vendor.o((...args) => $options.goPublish && $options.goPublish(...args), "30")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9d4f95ad"]]);
_sfc_main.__runtimeHooks = 2;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../../.sourcemap/mp-weixin/pages/tabBar/books/books.js.map
