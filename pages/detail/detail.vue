<template>
	<view class="page">
		<scroll-view scroll-y class="body">
			<view v-if="content" class="feed">
				<content-card :content="content" in-detail />

				<!-- 评论区域 -->
				<view class="comments-title">
					<text class="seal-title">评 论</text>
					<text class="comments-count">{{ approvedCount }} 条</text>
				</view>

				<view v-if="approvedComments.length" class="comments">
					<view v-for="cm in approvedComments" :key="cm.id" class="cm-item">
						<view class="cm-head">
							<view class="cm-avatar" :style="{ background: avatarColor(cm.userId) }">
								{{ cmName(cm.userId).slice(0, 1) }}
							</view>
							<view class="cm-main">
								<view class="cm-nick">{{ cmName(cm.userId) }}</view>
								<view class="cm-text">{{ cm.text }}</view>
								<view class="cm-time">{{ formatTime(cm.createTime) }}</view>
							</view>
						</view>
					</view>
				</view>
				<view v-else class="cm-empty">还没有评论，坐而言，不如起而评。</view>

				<view class="feed-bottom"></view>
			</view>
			<view v-else class="not-found">书帖不见了</view>
		</scroll-view>

		<!-- 评论输入条 -->
		<view class="input-bar">
			<input
				v-model="commentText"
				class="input"
				placeholder="写下你的评论（提交后待审核）"
				placeholder-class="input-ph"
				confirm-type="send"
				@confirm="sendComment"
			/>
			<view class="send" :class="{ disabled: !commentText.trim() }" @click="sendComment">评</view>
		</view>
	</view>
</template>

<script>
	import { useContentStore } from '@/store/content.js'
	import { useUserStore } from '@/store/user.js'
	import { formatTime } from '@/common/format.js'
	import contentCard from '@/components/content-card/content-card.vue'

	const AVATAR_COLORS = ['#07C160', '#576B95', '#E6A23C', '#5B8FF9', '#9254DE', '#FF7A45']

	export default {
		components: {
			contentCard
		},
		data() {
			return {
				id: '',
				content: null,
				commentText: ''
			}
		},
		computed: {
			allComments() {
				if (!this.content || !this.contentStore) return []
				return this.contentStore.getCommentsOf(this.content.id)
			},
			approvedComments() {
				return this.allComments.filter((c) => c.status === 'approved')
			},
			approvedCount() {
				return this.approvedComments.length
			}
		},
		created() {
			this.contentStore = useContentStore()
			this.userStore = useUserStore()
		},
		onLoad(options) {
			this.contentStore = useContentStore()
			this.userStore = useUserStore()
			this.contentStore.init()
			this.id = options.id || ''
			this.content = this.contentStore.getContent(this.id)
		},
		methods: {
			avatarColor(uid) {
				let h = 0
				for (let i = 0; i < uid.length; i++) h = (h * 31 + uid.charCodeAt(i)) % 997
				return AVATAR_COLORS[h % AVATAR_COLORS.length]
			},
			cmName(uid) {
				return this.contentStore.getUser(uid).nickname
			},
			formatTime(ts) {
				return formatTime(ts)
			},
			sendComment() {
				const text = this.commentText.trim()
				if (!text) return
				this.contentStore.addComment(this.content.id, text)
				this.commentText = ''
				if (uni.hideKeyboard) uni.hideKeyboard()
				uni.showToast({ title: '评论已提交，待审核', icon: 'none' })
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
	}

	.cm-main {
		margin-left: 20rpx;
		flex: 1;
		min-width: 0;
	}

	.cm-nick {
		font-size: 26rpx;
		color: $stone;
		font-weight: 600;
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
