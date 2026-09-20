import { defineStore } from 'pinia'
import { authApi, setToken, clearToken } from '@/common/api.js'

const STORAGE_KEY = 'xs_current_user'

// 模块级：正在进行中的静默登录 Promise，用于并发去重
let loginInFlight = null

/**
 * gender 为后端 Integer：
 * 0 / null / undefined = 未选择，1 = 男，2 = 女
 */
export const GENDER = {
	UNKNOWN: 0,
	MALE: 1,
	FEMALE: 2
}

export const useUserStore = defineStore('user', {
	state: () => {
		let user = null
		try {
			user = uni.getStorageSync(STORAGE_KEY) || null
		} catch (e) {
			user = null
		}
		return {
			user: user ? JSON.parse(JSON.stringify(user)) : null
		}
	},
	getters: {
		isLogin: (state) => !!state.user,
		isAdmin: (state) => {
			if (!state.user) return false
			return state.user.roleId === 1 || state.user.roleName === 'admin'
		},
		hasGender: (state) => {
			const g = state.user && state.user.gender
			return g === GENDER.MALE || g === GENDER.FEMALE
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
			// 已登录（缓存或本次会话已拉取过）：直接返回，不再请求
			if (this.user) {
				console.log('[silentLogin] skip, user exists:', this.user.userId)
				return Promise.resolve(this.user)
			}
			// 并发去重：上一次请求还没结束时，直接复用同一个 Promise
			if (loginInFlight) {
				console.log('[silentLogin] dedup, reuse in-flight request')
				return loginInFlight
			}
			loginInFlight = this._doSilentLogin().finally(() => {
				loginInFlight = null
			})
			return loginInFlight
		},
		/**
		 * 真正执行登录的内部方法，只应由 silentLogin() 调用
		 */
		async _doSilentLogin() {
			console.log('[silentLogin] start')
			let code = ''
			try {
				if (typeof uni.login === 'function') {
					// 兜底超时：3s 没拿到 code 就直接跳过，避免某些平台下
					// uni.login 既不 success 也不 fail 导致 promise 永远挂起
					const loginRes = await new Promise((resolve) => {
						let settled = false
						const done = (v) => {
							if (settled) return
							settled = true
							resolve(v)
						}
						try {
							uni.login({
								success: (res) => done(res || null),
								fail: () => done(null),
								complete: () => done(null)
							})
						} catch (e) {
							done(null)
						}
						setTimeout(() => done(null), 3000)
					})
					code = (loginRes && loginRes.code) || ''
				}
			} catch (e) {
				console.warn('[silentLogin] uni.login error', e)
			}

			try {
				const data = await authApi.silentLogin({ code })
				console.log('[silentLogin] /auth/login resp', data)
				if (data && typeof data === 'object') {
					// token 单独存储，不混在用户信息里
					if (data.token) {
						setToken(data.token)
					}
					const profile = Object.assign({}, data)
					delete profile.token
					this.user = profile
					this.persist()
				}
			} catch (e) {
				// 登录失败：不降级、不造默认用户，保留 user 为 null（缓存若有则保留）
				console.warn('[silentLogin] /auth/login failed', e)
			}
			return this.user
		},
		logout() {
			this.user = null
			clearToken()
			try {
				uni.removeStorageSync(STORAGE_KEY)
			} catch (e) {}
		},
		/**
		 * 重新请求 /auth/me 获取最新用户信息并覆盖本地缓存
		 * 页面（如我的 tab）onLoad/onShow 时调用，保证资料实时
		 */
		async refreshMe() {
			try {
				const data = await authApi.me()
				if (data && typeof data === 'object' && (data.userId || data.id)) {
					// 保留 token 单独存储的约定：不把 token 混进 user
					const profile = Object.assign({}, data)
					delete profile.token
					this.user = profile
					this.persist()
				}
				return this.user
			} catch (e) {
				console.warn('[refreshMe] /auth/me failed', e)
				return this.user
			}
		},
		updateUser(patch) {
			if (!this.user) return
			this.user = Object.assign({}, this.user, patch)
			this.persist()
		},
		persist() {
			try {
				uni.setStorageSync(STORAGE_KEY, this.user)
			} catch (e) {}
		}
	}
})