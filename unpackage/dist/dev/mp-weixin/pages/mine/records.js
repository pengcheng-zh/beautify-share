"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api = require("../../common/api.js");
const common_format = require("../../common/format.js");
const contentCard = () => "../../components/content-card/content-card.js";
const TAB_STATUS = ["", "A", "P", "R"];
const _sfc_main = {
  components: {
    contentCard
  },
  data() {
    return {
      current: 0,
      list: [],
      loading: false
    };
  },
  computed: {
    tabs() {
      return [
        { name: "全部" },
        { name: "待审核" },
        { name: "已通过" },
        { name: "未通过" }
      ];
    },
    emptyText() {
      return ["这里还没有书帖", "暂无待审核的书帖", "暂无已通过的书帖", "暂无未通过的书帖"][this.current];
    }
  },
  async onLoad(options) {
    this.current = Number(options.tab || 0);
    this.list = [];
    await this.loadList();
  },
  onShow() {
    this.loadList();
  },
  methods: {
    async switchTab(i) {
      if (this.current === i)
        return;
      this.current = i;
      this.list = [];
      await this.loadList();
    },
    async loadList() {
      if (this.loading)
        return;
      this.loading = true;
      try {
        const status = TAB_STATUS[this.current] || "";
        const res = await common_api.postApi.mine({ page: 1, pageSize: 50, status });
        const arr = res && res.data || (Array.isArray(res.data) ? res.data : []);
        this.list = Array.isArray(arr) ? arr : [];
      } catch (e) {
        common_vendor.index.__f__("warn", "at pages/mine/records.vue:94", "[records] loadList failed", e);
      } finally {
        this.loading = false;
      }
    },
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
      return {
        a: common_vendor.t(t.name),
        b: i,
        c: $data.current === i ? 1 : "",
        d: common_vendor.o(($event) => $options.switchTab(i), i)
      };
    }),
    b: common_vendor.f($data.list, (c, k0, i0) => {
      return common_vendor.e({
        a: $options.statusText(c.status)
      }, $options.statusText(c.status) ? {
        b: common_vendor.t($options.statusText(c.status)),
        c: common_vendor.n($options.statusClass(c.status))
      } : {}, {
        d: "32349060-0-" + i0,
        e: common_vendor.p({
          content: c
        }),
        f: c.id
      });
    }),
    c: !$data.loading && !$data.list.length
  }, !$data.loading && !$data.list.length ? {
    d: common_vendor.t($options.emptyText)
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-32349060"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/records.js.map
