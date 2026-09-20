"use strict";
const common_vendor = require("../../common/vendor.js");
const common_api = require("../../common/api.js");
const contentCard = () => "../../components/content-card/content-card.js";
const _sfc_main = {
  components: {
    contentCard
  },
  data() {
    return {
      list: [],
      loading: false
    };
  },
  onShow() {
    this.loadList();
  },
  onUnload() {
    this.list = [];
  },
  methods: {
    async loadList() {
      if (this.loading)
        return;
      this.loading = true;
      try {
        const res = await common_api.postApi.favoriteList({ page: 1, pageSize: 50 });
        this.list = res && res.data || res.data || [];
      } catch (e) {
        common_vendor.index.__f__("warn", "at pages/mine/favorites.vue:46", "[favorites] loadList failed", e);
      } finally {
        this.loading = false;
      }
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
    a: common_vendor.f($data.list, (c, k0, i0) => {
      return {
        a: c.id,
        b: "a229771a-0-" + i0,
        c: common_vendor.p({
          content: c
        })
      };
    }),
    b: !$data.list.length && !$data.loading
  }, !$data.list.length && !$data.loading ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-a229771a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/favorites.js.map
