"use strict";
function formatTime(ts) {
  if (!ts)
    return "";
  const now = Date.now();
  const diff = now - ts;
  const minute = 60 * 1e3;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute)
    return "刚刚";
  if (diff < hour)
    return Math.floor(diff / minute) + "分钟前";
  if (diff < day)
    return Math.floor(diff / hour) + "小时前";
  if (diff < 2 * day)
    return "昨天 " + pad(new Date(ts).getHours()) + ":" + pad(new Date(ts).getMinutes());
  const d = new Date(ts);
  const today = /* @__PURE__ */ new Date();
  if (d.getFullYear() === today.getFullYear()) {
    return d.getMonth() + 1 + "月" + d.getDate() + "日";
  }
  return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日";
}
function pad(n) {
  return n < 10 ? "0" + n : "" + n;
}
function statusText(status) {
  const map = {
    pending: "待审核",
    approved: "已通过",
    rejected: "未通过"
  };
  return map[status] || status;
}
function statusClass(status) {
  const map = {
    pending: "st-pending",
    approved: "st-approved",
    rejected: "st-rejected"
  };
  return map[status] || "";
}
function greeting() {
  const h = (/* @__PURE__ */ new Date()).getHours();
  if (h < 6)
    return "夜深了";
  if (h < 12)
    return "晨起读书";
  if (h < 18)
    return "午后翻书";
  return "灯下展卷";
}
exports.formatTime = formatTime;
exports.greeting = greeting;
exports.statusClass = statusClass;
exports.statusText = statusText;
//# sourceMappingURL=../../.sourcemap/mp-weixin/common/format.js.map
