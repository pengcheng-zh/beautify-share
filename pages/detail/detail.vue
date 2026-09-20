<template>
	<view class="page">
		<scroll-view scroll-y class="body">
			<view v-if="content" class="feed">
				<content-card :content="content" in-detail />

				<!-- 评论区域 -->
				<view class="comments-title">
					<text class="seal-title">评 论</text>
					<text class="comments-count">{{ comments.length }} 条</text>
				</view>

				<view v-if="comments.length" class="comments">
					<view v-for="cm in comments" :key="cm.id" class="cm-item">
						<view class="cm-head">
							<view class="cm-avatar" :style="{ background: avatarColor(cm.userId, cm.avatar) }">
								<image v-if="cm.avatar" class="cm-avatar-img" :src="cm.avatar" mode="aspectFill" />
								<text v-else>{{ cmName(cm).slice(0, 1) }}</text>
							</view>
							<view class="cm-main">
								<view class="cm-nick-row">
									<text class="cm-nick">{{ cmName(cm) }}</text>
									<text v-if="canDelete(cm)" class="cm-del" @click="deleteCm(cm)">删除</text>
								</view>
								<view class="cm-text">{{ cm.text || cm.content }}</view>
								<view class="cm-time">{{ formatTime(cm.createTime) }}</view>
							</view>
						</view>
					</view>

					<view v-if="loadingMore" class="cm-loading">加载更多…</view>
					<view v-else-if="!hasMore && comments.length" class="cm-loading">没有更多了</view>
				</view>
				<view v-else class="cm-empty">还没有评论，坐而言，不如起而评。</view>

				<view class="feed-bottom"></view>
			</view>
			<view v-else-if="loading" class="not-found">书帖载入中…</view>
			<view v-else class="not-found">书帖不见了</view>
		</scroll-view>

		<!-- 评论输入条 -->
		<view class="input-bar">
			<input
				v-model="commentText"
				class="input"
				placeholder="写下你的评论"
				placeholder-class="input-ph"
				confirm-type="send"
				@confirm="sendComment"
			/>
			<view class="send" :class="{ disabled: !commentText.trim() || sending }" @click="sendComment">评</view>
		</view>
	</view>
</template>

<script>
	import { postApi, commentApi } from '@/common/api.js'
	import { useUserStore } from '@/store/user.js'
	import { formatTime } from '@/common/format.js'
	import contentCard from '@/components/content-card/content-card.vue'

	const AVATAR_COLORS = ['#07C160', '#576B95', '#E6A23C', '#5B8FF9', '#9254DE', '#FF7A45']

	/**
	 * 把后端返回的评论归一化：兼容 text/content、username/nickname、avatar 等字段
	 */
	function normalizeComment(raw) {
		if (!raw) return null
		return {
			id: raw.id,
			postId: raw.postId,
			userId: raw.userId,
			text: raw.text || raw.content || '',
			username: raw.username || raw.nickname || '',
			avatar: raw.avatar || '',
			createTime: raw.createTime
		}
	}

	function pickList(data) {
		if (!data) return []
		if (Array.isArray(data)) return data
		for (const k of ['list', 'records', 'rows', 'items', 'content', 'data']) {
			if (Array.isArray(data[k])) return data[k]
		}
		return []
	}

	export default {
		components: {
			contentCard
		},
		data() {
			return {
				id: '',
				content: null,
				comments: [],
				page: 1,
				pageSize: 20,
				hasMore: true,
				loading: false,
				loadingMore: false,
				sending: false,
				commentText: ''
			}
		},
		computed: {
			meId() {
				if (!this.userStore || !this.userStore.user) return ''
				return this.userStore.user.userId || this.userStore.user.id || ''
			}
		},
		created() {
			this.userStore = useUserStore()
		},
		async onLoad(options) {
			this.id = options.id || ''
			await this.loadDetail()
			await this.loadComments(true)
		},
		onReachBottom() {
			if (!this.content || this.loadingMore || !this.hasMore) return
			this.loadComments(false)
		},
		methods: {
			async loadDetail() {
				if (!this.id) return
				this.loading = true
				try {
					// 详情直接走 /post/detail/{id}
					const data = await postApi.detail(this.id)
					this.content = data || null
				} catch (e) {
					console.warn('[detail] loadDetail failed', e)
					this.content = null
				} finally {
					this.loading = false
				}
			},
			async loadComments(refresh) {
				if (refresh) {
					this.page = 1
					this.hasMore = true
				}
				if (!this.hasMore) return
				if (refresh) {
					this.loading = true
				} else {
					this.loadingMore = true
				}
				try {
					// 评论列表直接走 /post-comment/list?postId=xxx
					const data = await commentApi.list({ postId: this.id, page: this.page, pageSize: this.pageSize })
					const arr = pickList(data).map(normalizeComment).filter(Boolean)
					if (refresh) {
						this.comments = arr
					} else {
						this.comments = this.comments.concat(arr)
					}
					this.hasMore = arr.length >= this.pageSize
					if (this.hasMore) this.page += 1
				} catch (e) {
					console.warn('[detail] loadComments failed', e)
				} finally {
					this.loading = false
					this.loadingMore = false
				}
			},
			avatarColor(uid, avatar) {
				if (avatar) return 'transparent'
				const s = String(uid || '')
				let h = 0
				for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997
				return AVATAR_COLORS[h % AVATAR_COLORS.length]
			},
			cmName(cm) {
				return cm.username || cm.nickname || '无名书友'
			},
			formatTime(ts) {
				return formatTime(ts)
			},
			canDelete(cm) {
				return this.meId && String(cm.userId) === String(this.meId)
			},
			async sendComment() {
				const text = this.commentText.trim()
				if (!text || !this.content || this.sending) return
				this.sending = true
				try {
					await commentApi.create({ postId: this.content.id, text })
					this.commentText = ''
					if (uni.hideKeyboard) uni.hideKeyboard()
					uni.showToast({ title: '评论已提交', icon: 'none' })
					// 重新拉第一页（评论条数从后端真实返回，避免本地伪递增）
					await this.loadComments(true)
					// 主帖 commentCount 同步刷新（后端为准）
					if (this.content && this.content.commentCount !== undefined) {
						this.content.commentCount = (Number(this.content.commentCount) || 0) + 1
					}
				} catch (e) {
					uni.showToast({ title: (e && e.message) || '评论失败', icon: 'none' })
				} finally {
					this.sending = false
				}
			},
			async deleteCm(cm) {
				if (!this.content) return
				uni.showModal({
					title: '删除评论',
					content: '确定要删除这条评论吗？',
					success: async (r) => {
						if (!r.confirm) return
						try {
							await commentApi.delete(cm.id)
							this.comments = this.comments.filter((c) => String(c.id) !== String(cm.id))
							if (this.content && this.content.commentCount !== undefined) {
								this.content.commentCount = Math.max(0, (Number(this.content.commentCount) || 0) - 1)
							}
							uni.showToast({ title: '已删除', icon: 'none' })
						} catch (e) {
							uni.showToast({ title: '删除失败', icon: 'none' })
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		box-sizing: border-box;
	}

	.body {
		flex: 1;
		height: 0;
	}

	.feed {
		padding: 20rpx 24rpx 0;
	}

	.comments-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 40rpx 8rpx 20rpx;
	}

	.comments-count {
		font-size: 26rpx;
		color: $ink-soft;
	}

	.comments {
		padding: 10rpx 8rpx;
	}

	.cm-item {
		padding: 22rpx 0;
		border-bottom: 1rpx solid rgba(0, 0, 0, 0.06);
	}

	.cm-item:last-child {
		border-bottom: none;
	}

	.cm-head {
		display: flex;
	}

	.cm-avatar {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		color: #FFFFFF;
		font-size: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		overflow: hidden;
	}

	.cm-avatar-img {
		width: 100%;
		height: 100%;
	}

	.cm-main {
		margin-left: 20rpx;
		flex: 1;
		min-width: 0;
	}

	.cm-nick-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.cm-nick {
		font-size: 26rpx;
		color: $stone;
		font-weight: 600;
	}

	.cm-del {
		font-size: 22rpx;
		color: $ink-soft;
		padding: 2rpx 10rpx;
		border: 1rpx solid $uni-border-color;
		border-radius: 6rpx;
	}

	.cm-text {
		margin-top: 6rpx;
		font-size: 28rpx;
		color: #191919;
		line-height: 1.7;
		word-break: break-all;
	}

	.cm-time {
		margin-top: 8rpx;
		font-size: 22rpx;
		color: $ink-soft;
	}

	.cm-loading {
		padding: 24rpx 0;
		text-align: center;
		font-size: 24rpx;
		color: $ink-soft;
	}

	.cm-empty {
		padding: 60rpx 0;
		text-align: center;
		font-size: 26rpx;
		color: $ink-soft;
	}

	.feed-bottom {
		height: 40rpx;
	}

	.not-found {
		padding: 200rpx 0;
		text-align: center;
		color: $ink-soft;
	}

	/* 输入条 */
	.input-bar {
		display: flex;
		align-items: center;
		padding: 16rpx 24rpx;
		padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
		background: $paper-light;
		border-top: 1rpx solid $uni-border-color;
	}

	.input {
		flex: 1;
		height: 76rpx;
		background: $paper-deep;
		border-radius: 999rpx;
		padding: 0 30rpx;
		font-size: 28rpx;
		color: $ink;
	}

	.input-ph {
		color: #B2B2B2;
	}

	.send {
		width: 84rpx;
		height: 76rpx;
		margin-left: 18rpx;
		border-radius: 999rpx;
		background: linear-gradient(145deg, $cinnabar-light, $cinnabar);
		color: #FFFFFF;
		font-size: 34rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.send.disabled {
		opacity: 0.4;
	}
</style>