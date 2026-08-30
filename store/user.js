import { defineStore } from 'pinia'

const STORAGE_KEY = 'xs_current_user'

const DEFAULT_USER = {
	id: 'u1',
	nickname: '若谷',
	sign: '一箪食，一瓢饮，在陋巷，不改其乐。',
	role: 'admin', // admin | member
	gender: '', // '' | 'male' | 'female'
	location: '杭州 · 运河书市',
	stats: {
		published: 0,
		approved: 0,
		pending: 0,
		liked: 0,
		favorited: 0,
		shared: 0
	}
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
		isAdmin: (state) => !!(state.user && state.user.role === 'admin')
	},
	actions: {
		login(payload = {}) {
			const merged = Object.assign({}, DEFAULT_USER, {
				id: payload.id || DEFAULT_USER.id,
				nickname: payload.nickname || DEFAULT_USER.nickname,
				sign: payload.sign || DEFAULT_USER.sign,
				role: payload.role || DEFAULT_USER.role,
				gender: payload.gender || DEFAULT_USER.gender,
				location: payload.location || DEFAULT_USER.location
			})
			this.user = merged
			this.persist()
		},
		logout() {
			this.user = null
			try {
				uni.removeStorageSync(STORAGE_KEY)
			} catch (e) {}
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
