"use strict";
const common_vendor = require("./vendor.js");
const BASE_URL = "http://localhost:8080";
const TOKEN_KEY = "xs_token";
function getToken() {
  try {
    return common_vendor.index.getStorageSync(TOKEN_KEY) || "";
  } catch (e) {
    return "";
  }
}
function setToken(token) {
  try {
    if (token) {
      common_vendor.index.setStorageSync(TOKEN_KEY, token);
    } else {
      common_vendor.index.removeStorageSync(TOKEN_KEY);
    }
  } catch (e) {
  }
}
function clearToken() {
  setToken("");
}
function request({
  url,
  method = "GET",
  data = {},
  header = {},
  timeout = 8e3
}) {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const authHeader = token ? { Authorization: token } : {};
    common_vendor.index.request({
      url: BASE_URL + url,
      method,
      data,
      header: Object.assign({ "Content-Type": "application/json" }, authHeader, header),
      timeout,
      success: (res) => {
        const status = res.statusCode;
        const body = res.data || {};
        if (status >= 200 && status < 300) {
          if (body && typeof body === "object" && "result" in body) {
            if (body.result === true || body.result === "true") {
              resolve(body.object === void 0 ? body : body.object);
            } else {
              reject({
                code: body.messageId || status,
                message: body.message || "请求失败",
                raw: body
              });
            }
          } else {
            resolve(body);
          }
        } else {
          reject({ code: status, message: "网络异常", raw: body });
        }
      },
      fail: (err) => {
        reject({ code: -1, message: err && err.errMsg || "网络异常", raw: err });
      }
    });
  });
}
const authApi = {
  /**
   * 静默登录：客户端仅提供微信 code（若有），
   * 后端据此识别用户并返回完整用户资料（含 gender 等）。
   * @param {Object} payload
   * @param {string} [payload.code]  uni.login() 返回的 code
   */
  silentLogin: (payload = {}) => request({
    url: "/auth/login",
    method: "POST",
    data: payload
  }),
  /**
   * 更新用户性别
   * @param {number} gender 后端 Integer：1 = 男，2 = 女
   */
  updateGender: (gender) => request({
    url: "/auth/update-gender",
    method: "POST",
    data: { gender }
  }),
  /**
   * 获取当前登录用户信息（需携带 token）
   * @returns {Promise<Object>} 最新的用户资料
   */
  me: () => request({
    url: "/auth/me",
    method: "GET"
  })
};
const uploadApi = {
  /**
   * 上传单个文件（图片 / 语音等）
   * @param {string} filePath 本地临时文件路径（tempFilePath）
   * @returns {Promise<string>} 后端返回的文件访问 URL
   */
  uploadFile: (filePath) => new Promise((resolve, reject) => {
    common_vendor.index.uploadFile({
      url: BASE_URL + "/upload/file",
      filePath,
      name: "file",
      header: {
        Authorization: getToken()
      },
      success: (res) => {
        const status = res.statusCode;
        let body = {};
        try {
          body = typeof res.data === "string" ? JSON.parse(res.data) : res.data || {};
        } catch (e) {
          body = {};
        }
        if (status >= 200 && status < 300) {
          if (body && typeof body === "object" && "result" in body) {
            if (body.result === true || body.result === "true") {
              const obj = body.object;
              if (obj && typeof obj === "object" && obj.url !== void 0) {
                resolve(obj.url);
              } else if (typeof obj === "string") {
                resolve(obj);
              } else {
                reject({ code: body.messageId || status, message: "上传成功但未返回文件地址", raw: body });
              }
            } else {
              reject({ code: body.messageId || status, message: body.message || "上传失败", raw: body });
            }
          } else {
            resolve(body);
          }
        } else {
          reject({ code: status, message: "上传失败", raw: body });
        }
      },
      fail: (err) => {
        reject({ code: -1, message: err && err.errMsg || "上传失败", raw: err });
      }
    });
  })
};
const postApi = {
  /** 首页信息流，分页 */
  feed: ({ page = 1, pageSize = 10 } = {}) => request({
    url: `/post/feed?page=${page}&pageSize=${pageSize}`,
    method: "GET"
  }),
  /** 书帖详情 */
  detail: (id) => request({
    url: `/post/detail/${id}`,
    method: "GET"
  }),
  /** 点赞（toggle，由后端决定当前状态） */
  like: (id) => request({
    url: `/post-like/${id}`,
    method: "POST"
  }),
  /** 收藏（toggle） */
  favorite: (id) => request({
    url: `/post-favorite/${id}`,
    method: "POST"
  }),
  /**
   * 我点赞过的书帖列表，分页
   * @param {Object} params
   * @param {number} [params.page=1]
   * @param {number} [params.pageSize=20]
   */
  likeList: ({ page = 1, pageSize = 20 } = {}) => request({
    url: `/post/like-list?page=${page}&pageSize=${pageSize}`,
    method: "GET"
  }),
  /**
   * 我收藏的书帖列表，分页
   * @param {Object} params
   * @param {number} [params.page=1]
   * @param {number} [params.pageSize=20]
   */
  favoriteList: ({ page = 1, pageSize = 20 } = {}) => request({
    url: `/post/favorite-list?page=${page}&pageSize=${pageSize}`,
    method: "GET"
  }),
  /**
   * 我的发布，分页
   * @param {Object} params
   * @param {number} [params.page=1]
   * @param {number} [params.pageSize=10]
   * @param {string} [params.status] 审核状态：A=待审核, B/P=已通过, C/R=未通过。不传 = 全部
   */
  mine: ({ page = 1, pageSize = 10, status } = {}) => {
    const qs = `page=${page}&pageSize=${pageSize}` + (status ? `&status=${encodeURIComponent(status)}` : "");
    return request({
      url: `/post/mine?${qs}`,
      method: "GET"
    });
  },
  /**
   * 我的数据汇总（发布/点赞/收藏/分享 计数）
   * 后端字段：postCount, likeCount, favoriteCount, shareCount
   */
  mineSummary: () => request({
    url: "/post/mine-summary",
    method: "GET"
  }),
  /**
   * 创建书帖
   * @param {Object} payload
   * @param {string} payload.content    正文
   * @param {string[]} payload.pictures 图片 URL 列表
   * @param {string} [payload.location] 位置名称
   * @param {string} [payload.latitude] 纬度
   * @param {string} [payload.longitude] 经度
   * @param {string} [payload.voice]    语音 URL
   */
  create: (payload) => request({
    url: "/post/create",
    method: "POST",
    data: payload
  })
};
const commentApi = {
  /** 创建评论 */
  create: ({ postId, text }) => request({
    url: "/post-comment/create",
    method: "POST",
    data: { postId, text }
  }),
  /** 删除评论 */
  delete: (id) => request({
    url: `/post-comment/${id}`,
    method: "DELETE"
  }),
  /** 评论列表，分页 */
  list: ({ postId, page = 1, pageSize = 20 }) => request({
    url: `/post-comment/list?postId=${encodeURIComponent(postId)}&page=${page}&pageSize=${pageSize}`,
    method: "GET"
  })
};
const adminApi = {
  /**
   * 管理端书帖列表，分页
   * @param {Object} params
   * @param {number} [params.page=1]
   * @param {number} [params.pageSize=20]
   * @param {string} [params.status] 审核状态：A=待审核, B=已通过, C=已驳回。不传 = 待审核
   */
  postList: ({ page = 1, pageSize = 20, status } = {}) => {
    const qs = `page=${page}&pageSize=${pageSize}` + (status ? `&status=${encodeURIComponent(status)}` : "");
    return request({
      url: `/admin/post/list?${qs}`,
      method: "GET"
    });
  },
  /**
   * 管理端评论列表，分页
   * @param {Object} params
   * @param {number} [params.page=1]
   * @param {number} [params.pageSize=20]
   * @param {string} [params.status] 审核状态：A=待审核, B=已通过, C=已驳回。不传 = 待审核
   */
  commentList: ({ page = 1, pageSize = 20, status } = {}) => {
    const qs = `page=${page}&pageSize=${pageSize}` + (status ? `&status=${encodeURIComponent(status)}` : "");
    return request({
      url: `/admin/comment/list?${qs}`,
      method: "GET"
    });
  },
  /**
   * 管理端书帖审核
   * @param {Object} params
   * @param {number|string} params.id 内容 id
   * @param {string} params.status 审核结果：P=通过, R=驳回
   * @param {string} [params.reason] 驳回原因
   */
  postAudit: ({ id, status, reason }) => request({
    url: "/admin/post/audit",
    method: "POST",
    data: { id, status, reason }
  }),
  /**
   * 管理端评论审核
   * @param {Object} params
   * @param {number|string} params.id 评论 id
   * @param {string} params.status 审核结果：P=通过, R=驳回
   * @param {string} [params.reason] 驳回原因
   */
  commentAudit: ({ id, status, reason }) => request({
    url: "/admin/comment/audit",
    method: "POST",
    data: { id, status, reason }
  })
};
exports.adminApi = adminApi;
exports.authApi = authApi;
exports.clearToken = clearToken;
exports.commentApi = commentApi;
exports.postApi = postApi;
exports.setToken = setToken;
exports.uploadApi = uploadApi;
//# sourceMappingURL=../../.sourcemap/mp-weixin/common/api.js.map
