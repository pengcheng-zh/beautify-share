"use strict";
const common_vendor = require("../common/vendor.js");
const common_api = require("../common/api.js");
const STORAGE_KEY = "xs_current_user";
let loginInFlight = null;
const GENDER = {
  UNKNOWN: 0,
  MALE: 1,
  FEMALE: 2
};
const useUserStore = common_vendor.defineStore("user", {
  state: () => {
    let user = null;
    try {
      user = common_vendor.index.getStorageSync(STORAGE_KEY) || null;
    } catch (e) {
      user = null;
    }
    return {
      user: user ? JSON.parse(JSON.stringify(user)) : null
    };
  },
  getters: {
    isLogin: (state) => !!state.user,
    isAdmin: (state) => {
      if (!state.user)
        return false;
      return state.user.roleId === 1 || state.user.roleName === "admin";
    },
    hasGender: (state) => {
      const g = state.user && state.user.gender;
      return g === GENDER.MALE || g === GENDER.FEMALE;
    }
  },
  actions: {
    /**
     * 静默登录：调用后端 /auth/login，把返回的用户信息保存到本地 store
     * - 微信小程序下会先调 uni.login() 拿 code，一并交给后端识别用户
     * - 去重：已有用户信息直接返回；并发调用复用同一个 in-flight Promise，
     *   保证一次应用启动最多只发一次 /auth/login
     */
    silentLogin() {
      if (this.user) {
        common_vendor.index.__f__("log", "at store/user.js:52", "[silentLogin] skip, user exists:", this.user.userId);
        return Promise.resolve(this.user);
      }
      if (loginInFlight) {
        common_vendor.index.__f__("log", "at store/user.js:57", "[silentLogin] dedup, reuse in-flight request");
        return loginInFlight;
      }
      loginInFlight = this._doSilentLogin().finally(() => {
        loginInFlight = null;
      });
      return loginInFlight;
    },
    /**
     * 真正执行登录的内部方法，只应由 silentLogin() 调用
     */
    async _doSilentLogin() {
      common_vendor.index.__f__("log", "at store/user.js:69", "[silentLogin] start");
      let code = "";
      try {
        if (typeof common_vendor.index.login === "function") {
          const loginRes = await new Promise((resolve) => {
            let settled = false;
            const done = (v) => {
              if (settled)
                return;
              settled = true;
              resolve(v);
            };
            try {
              common_vendor.index.login({
                success: (res) => done(res || null),
                fail: () => done(null),
                complete: () => done(null)
              });
            } catch (e) {
              done(null);
            }
            setTimeout(() => done(null), 3e3);
          });
          code = loginRes && loginRes.code || "";
        }
      } catch (e) {
        common_vendor.index.__f__("warn", "at store/user.js:96", "[silentLogin] uni.login error", e);
      }
      try {
        const data = await common_api.authApi.silentLogin({ code });
        common_vendor.index.__f__("log", "at store/user.js:101", "[silentLogin] /auth/login resp", data);
        if (data && typeof data === "object") {
          if (data.token) {
            common_api.setToken(data.token);
          }
          const profile = Object.assign({}, data);
          delete profile.token;
          this.user = profile;
          this.persist();
        }
      } catch (e) {
        common_vendor.index.__f__("warn", "at store/user.js:114", "[silentLogin] /auth/login failed", e);
      }
      return this.user;
    },
    logout() {
      this.user = null;
      common_api.clearToken();
      try {
        common_vendor.index.removeStorageSync(STORAGE_KEY);
      } catch (e) {
      }
    },
    /**
     * 重新请求 /auth/me 获取最新用户信息并覆盖本地缓存
     * 页面（如我的 tab）onLoad/onShow 时调用，保证资料实时
     */
    async refreshMe() {
      try {
        const data = await common_api.authApi.me();
        if (data && typeof data === "object" && (data.userId || data.id)) {
          const profile = Object.assign({}, data);
          delete profile.token;
          this.user = profile;
          this.persist();
        }
        return this.user;
      } catch (e) {
        common_vendor.index.__f__("warn", "at store/user.js:141", "[refreshMe] /auth/me failed", e);
        return this.user;
      }
    },
    updateUser(patch) {
      if (!this.user)
        return;
      this.user = Object.assign({}, this.user, patch);
      this.persist();
    },
    persist() {
      try {
        common_vendor.index.setStorageSync(STORAGE_KEY, this.user);
      } catch (e) {
      }
    }
  }
});
exports.GENDER = GENDER;
exports.useUserStore = useUserStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/store/user.js.map
