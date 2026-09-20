import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { postApi, commentApi } from '@/common/api.js'

/**
 * 内容 store —— 全部对接后端接口
 *
 * 设计原则：
 * - 所有列表（feed、mine、comments）都从后端拉取，不再 seed 任何 mock 数据
 * - store 只做内存缓存 + 乐观更新；不持久化到本地存储
 * - 个人操作（点赞/收藏/分享/审核）若后端尚未提供端点，先在本地做最优更新并标注 TODO
 */

function asNumber(v, d = 0) {
	if (typeof v === 'number') return v
	const n = Number(v)
	return Number.isFinite(n) ? n : d
}

function asBool(v) {
	return v === true || v === 'true' || v === 1 || v === '1'
}

function asTime(v) {
	if (typeof v === 'number') return v
	if (!v) return Date.now()
	const t = new Date(v).getTime()
	return Number.isFinite(t) ? t : Date.now()
}

/**
 * 把后端返回的单条书帖归一化成前端统一字段
 */
function normalizePost(raw) {
	if (!raw) return null
	return {
		id: raw.id,
		userId: raw.userId,
		text: raw.text || raw.content || '',
		images: Array.isArray(raw.images) ? raw.images : [],
		voice: raw.voice || {
			path: raw.voicePath || raw.voiceUrl || '',
			duration: asNumber(raw.voiceDuration)
		},
		location: raw.location || null,
		createTime: asTime(raw.createTime),
		status: raw.status || 'approved',
		likeCount: asNumber(raw.likeCount),
		favoriteCount: asNumber(raw.favoriteCount),
		commentCount: asNumber(raw.commentCount),
		shareCount: asNumber(raw.shareCount),
		liked: asBool(raw.liked),
		favorited: asBool(raw.favorited),
		recentLikers: Array.isArray(raw.recentLikers) ? raw.recentLikers : [],
		user: raw.user || null
	}
}

function normalizeComment(raw) {
	if (!raw) return null
	return {
		id: raw.id,
		postId: raw.postId,
		userId: raw.userId,
		text: raw.text || raw.content || '',
		createTime: asTime(raw.createTime),
		status: raw.status || 'approved',
		user: raw.user || null
	}
}

/**
 * 兼容多种列表返回结构：直接是数组、或者包裹在 list/records/rows/items/content 中
 */
function normalizeList(data) {
	if (!data) return []
	if (Array.isArray(data)) return data
	for (const key of ['list', 'records', 'rows', 'items', 'content']) {
		if (Array.isArray(data[key])) return data[key]
	}
	return []
}

export const useContentStore = defineStore('content', {
	state: () => ({
		/* 信息流 */
		feed: [],
		feedPage: 0,
		feedHasMore: true,
		feedLoading: false,

		/* 我的发布 */
		mine: [],
		minePage: 0,
		mineHasMore: true,
		mineLoading: false,

		/* 详情缓存：id -> post */
		details: {},

		/* 评论缓存：postId -> { list, page, hasMore, loading } */
		comments: {},
		commentsVersion: 0,

		/* 待审核内容（无后端端点前保持空集） */
		pendingContents: [],
		pendingComments: [],

		/* 个人操作痕迹（本端仅用于『我的点赞/收藏/分享』页面） */
		likedIds: [],
		favoritedIds: [],
		sharedIds: [],

		/* 用户信息缓存：userId -> user */
		users: {}
	}),

	getters: {
		approvedContents: (state) => state.feed.slice()
	},

	actions: {
		/* ==================== 信息流 ==================== */
		async loadFeed({ page = 1, pageSize = 10, refresh = false } = {}) {
			if (this.feedLoading) return []
			this.feedLoading = true
			try {
				const res = await postApi.feed({ page, pageSize })
				const list = (res && res.data) || res.data || []
				if (refresh) {
					this.feed = list
				} else {
					this.feed = this.feed.concat(list)
				}
				this.feedPage = page
				this.feedHasMore = list.length >= pageSize
				this.cacheUsersFromPosts(list)
				return list
			} catch (e) {
				uni.showToast({ title: '信息加载失败', icon: 'none' })
				return []
			} finally {
				this.feedLoading = false
			}
		},

		async refreshFeed() {
			return this.loadFeed({ page: 1, refresh: true })
		},

		/* ==================== 详情 ==================== */
		async getContent(id) {
			const found = this._findPost(id)
			if (found) return found
			try {
				const data = await postApi.detail(id)
				const detail = normalizePost(data)
				if (detail) {
					this.details[id] = detail
					this.cacheUsersFromPosts([detail])
				}
				return detail
			} catch (e) {
				return null
			}
		},

		/* ==================== 点赞 / 收藏 / 分享 ==================== */
		async toggleLike(id) {
			const post = this._findPost(id)
			const wasLiked = !!(post && post.liked)
			// 乐观更新
			if (post) {
				post.liked = !wasLiked
				post.likeCount = Math.max(0, asNumber(post.likeCount) + (wasLiked ? -1 : 1))
			}
			try {
				await postApi.like(id)
				if (wasLiked) {
					this.likedIds = this.likedIds.filter((x) => String(x) !== String(id))
				} else if (!this.likedIds.some((x) => String(x) === String(id))) {
					this.likedIds.push(id)
				}
			} catch (e) {
				// 回滚
				if (post) {
					post.liked = wasLiked
					post.likeCount = Math.max(0, asNumber(post.likeCount) + (wasLiked ? 1 : -1))
				}
				uni.showToast({ title: '点赞失败，请稍后再试', icon: 'none' })
			}
		},

		async toggleFav(id) {
			const post = this._findPost(id)
			const wasFav = !!(post && post.favorited)
			if (post) {
				post.favorited = !wasFav
				post.favoriteCount = Math.max(0, asNumber(post.favoriteCount) + (wasFav ? -1 : 1))
			}
			try {
				await postApi.favorite(id)
				if (wasFav) {
					this.favoritedIds = this.favoritedIds.filter((x) => String(x) !== String(id))
				} else if (!this.favoritedIds.some((x) => String(x) === String(id))) {
					this.favoritedIds.push(id)
				}
			} catch (e) {
				if (post) {
					post.favorited = wasFav
					post.favoriteCount = Math.max(0, asNumber(post.favoriteCount) + (wasFav ? 1 : -1))
				}
				uni.showToast({ title: '收藏失败，请稍后再试', icon: 'none' })
			}
		},

		recordShare(id) {
			// 后端暂未提供分享记录接口，本端仅本地计数
			const post = this._findPost(id)
			if (post) post.shareCount = asNumber(post.shareCount) + 1
			if (!this.sharedIds.some((x) => String(x) === String(id))) {
				this.sharedIds.push(id)
			}
		},

		/* ==================== 评论 ==================== */
		async getCommentsOf(postId, { page = 1, pageSize = 20, refresh = false } = {}) {
			const key = String(postId)
			if (!this.comments[key]) {
				this.comments[key] = { list: [], page: 0, hasMore: true, loading: false }
			}
			const bucket = this.comments[key]
			if (bucket.loading) return bucket.list
			if (!refresh && !bucket.hasMore) return bucket.list
			bucket.loading = true
			try {
				const data = await commentApi.list({ postId, page, pageSize })
				const list = normalizeList(data).map(normalizeComment).filter(Boolean)
				if (refresh) {
					bucket.list = list
				} else {
					bucket.list = bucket.list.concat(list)
				}
				bucket.page = page
				bucket.hasMore = list.length >= pageSize
				this.cacheUsersFromComments(list)
				this.commentsVersion++
				return bucket.list
			} catch (e) {
				uni.showToast({ title: '评论加载失败', icon: 'none' })
				return bucket.list
			} finally {
				bucket.loading = false
			}
		},

		async addComment(postId, text) {
			try {
				await commentApi.create({ postId, text })
				// 评论数 +1（乐观）
				const post = this._findPost(postId)
				if (post) post.commentCount = asNumber(post.commentCount) + 1
				// 刷新评论列表第一页
				await this.getCommentsOf(postId, { page: 1, refresh: true })
				return true
			} catch (e) {
				uni.showToast({ title: (e && e.message) || '评论失败', icon: 'none' })
				return false
			}
		},

		async removeComment(commentId, postId) {
			try {
				await commentApi.delete(commentId)
				const key = String(postId)
				if (this.comments[key]) {
					this.comments[key].list = this.comments[key].list.filter(
						(c) => String(c.id) !== String(commentId)
					)
					this.commentsVersion++
				}
				const post = this._findPost(postId)
				if (post) post.commentCount = Math.max(0, asNumber(post.commentCount) - 1)
				return true
			} catch (e) {
				uni.showToast({ title: '删除失败', icon: 'none' })
				return false
			}
		},

		/* ==================== 我的发布 ==================== */
		async loadMine({ page = 1, pageSize = 10, refresh = false } = {}) {
			if (this.mineLoading) return []
			this.mineLoading = true
			try {
				const data = await postApi.mine({ page, pageSize })
				const list = normalizeList(data).map(normalizePost).filter(Boolean)
				if (refresh) {
					this.mine = list
				} else {
					this.mine = this.mine.concat(list)
				}
				this.minePage = page
				this.mineHasMore = list.length >= pageSize
				this.cacheUsersFromPosts(list)
				return list
			} catch (e) {
				uni.showToast({ title: '我的发布加载失败', icon: 'none' })
				return []
			} finally {
				this.mineLoading = false
			}
		},

		async refreshMine() {
			return this.loadMine({ page: 1, refresh: true })
		},

		/* ==================== 兼容旧调用入口 ==================== */
		/**
		 * 保留 init() 是为了兼容老页面；实际只触发信息流刷新
		 */
		init() {
			this.refreshFeed()
		},

		/* ==================== 本地操作（无后端端点前的占位） ==================== */
		/**
		 * 发布：后端暂未提供 /post/create 接口，
		 * 这里先做本地乐观创建以保持发布流程可用；待接口到位后接入。
		 */
		publish(payload) {
			const userStore = useUserStore()
			const id = 'local_' + Date.now()
			const post = normalizePost({
				id,
				userId: userStore.user ? userStore.user.id : '',
				text: payload.text,
				images: payload.images,
				voice: payload.voice,
				location: payload.location,
				createTime: Date.now(),
				status: 'pending',
				user: userStore.user
			})
			this.mine.unshift(post)
			return post
		},

		/**
		 * 审核：后端未提供审核接口，先本地状态翻转
		 */
		auditContent(id, status) {
			const c = this._findPost(id)
			if (c) c.status = status
			this.pendingContents = this.pendingContents.filter((x) => String(x.id) !== String(id))
		},

		auditComment(id, status) {
			this.pendingComments = this.pendingComments.filter((x) => String(x.id) !== String(id))
		},

		/* ==================== 个人数据 getters ==================== */
		myContents() {
			return this.mine.slice().sort((a, b) => b.createTime - a.createTime)
		},

		myLiked() {
			return this.likedIds
				.map((id) => this._findPost(id))
				.filter(Boolean)
		},

		myFavorited() {
			return this.favoritedIds
				.map((id) => this._findPost(id))
				.filter(Boolean)
		},

		myShared() {
			return this.sharedIds
				.map((id) => this._findPost(id))
				.filter(Boolean)
		},

		/* ==================== 用户信息 ==================== */
		getUser(id) {
			if (!id) return { id: '', nickname: '无名书友', sign: '', location: '', avatar: '' }
			const userStore = useUserStore()
			if (userStore.user && String(userStore.user.id) === String(id)) {
				return { ...userStore.user }
			}
			const u = this.users[id]
			if (u) return { id, ...u }
			return { id, nickname: '无名书友', sign: '', location: '', avatar: '' }
		},

		cacheUsersFromPosts(posts) {
			posts.forEach((p) => {
				if (p && p.userId && p.user) {
					this.users[p.userId] = { ...(this.users[p.userId] || {}), ...p.user }
				}
			})
		},

		cacheUsersFromComments(comments) {
			comments.forEach((c) => {
				if (c && c.userId && c.user) {
					this.users[c.userId] = { ...(this.users[c.userId] || {}), ...c.user }
				}
			})
		},

		/* ==================== 内部工具 ==================== */
		_findPost(id) {
			const sid = String(id)
			return (
				this.feed.find((c) => String(c.id) === sid) ||
				this.mine.find((c) => String(c.id) === sid) ||
				this.details[sid] ||
				null
			)
		}
	}
})