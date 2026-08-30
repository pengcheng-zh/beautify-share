"use strict";
const store_content = require("../../store/content.js");
const common_format = require("../../common/format.js");
const common_vendor = require("../../common/vendor.js");
const contentCard = () => "../../components/content-card/content-card.js";
const _sfc_main = {
  components: {
    contentCard
  },
  data() {
    return {
      current: 0
    };
  },
  computed: {
    contentStore() {
      return this._store;
    },
    myContents() {
      return this._store ? this._store.myContents() : [];
    },
    tabs() {
      return [
        { name: "全部", count: this.myContents.length },
        { name: "待审核", count: this.myContents.filter((c) => c.status === "pending").length },
        { name: "已通过", count: this.myContents.filter((c) => c.status === "approved").length },
        { name: "未通过", count: this.myContents.filter((c) => c.status === "rejected").length }
      ];
    },
    filtered() {
      if (this.current === 0)
        return this.myContents;
      const map = { 1: "pending", 2: "approved", 3: "rejected" };
      return this.myContents.filter((c) => c.status === map[this.current]);
    }
  },
  created() {
    this._store = store_content.useContentStore();
  },
  onLoad(options) {
    this._store = store_content.useContentStore();
    this._store.init();
    this.current = Number(options.tab || 0);
  },
  methods: {
    statusText: common_format.statusText,
    statusClass: common_format.statusClass
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
    a: common_vendor.f($options.tabs, (t, i, i0) => {
      return common_vendor.e({
        a: common_vendor.t(t.name),
        b: t.count
      }, t.count ? {
        c: common_vendor.t(t.count)
      } : {}, {
        d: i,
        e: $data.current === i ? 1 : "",
        f: common_vendor.o(($event) => $data.current = i, i)
      });
    }),
    b: common_vendor.f($options.filtered, (c, k0, i0) => {
      return {
        a: common_vendor.t($options.statusText(c.status)),
        b: common_vendor.n($options.statusClass(c.status)),
        c: "32349060-0-" + i0,
        d: common_vendor.p({
          content: c
        }),
        e: c.id
      };
    }),
    c: !$options.filtered.length
  }, !$options.filtered.length ? {
    d: common_vendor.t($data.current === 1 ? "暂无待审核的书帖" : "这里还没有书帖")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-32349060"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/records.js.map
