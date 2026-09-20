<template>
	<view class="cc card" @click="goDetail">
		<!-- 头部 -->
		<view class="head">
			<view class="avatar" :style="{ background: avatarBg }">
				<image v-if="content.avatar" class="avatar-img" :src="content.avatar" mode="aspectFill" />
				<text v-else class="avatar-text">{{ nickname.slice(0, 1) }}</text>
			</view>
			<view class="head-info">
				<view class="name-row">
					<text class="nick">{{ nickname }}</text>
					<text v-if="isMine" class="tag-mine">我</text>
				</view>
				<text class="time">
					{{ timeText }}
					<text v-if="locationName" class="loc">{{ locationName }}</text>
				</text>
			</view>
		</view>

		<!-- 正文 -->
		<view v-if="text" class="body-text" :class="{ 'with-more': !expanded && text.length > 90 }">
			<text>{{ text }}</text>
			<text v-if="!expanded && text.length > 90" class="more" @click.stop="expanded = true">全文</text>
		</view>

		<!-- 九宫格图片 -->
		<view v-if="images.length" class="grid" :class="'grid-n' + images.length">
			<view
				v-for="(img, i) in images"
				:key="i"
				class="grid-item"
				:class="{
					'grid-single': images.length === 1,
					'grid-half': images.length === 2
				}"
				@click.stop="preview(i)"
			>
				<image class="grid-img" :src="img" mode="aspectFill" lazy-load />
			</view>
		</view>

		<!-- 语音 -->
		<view v-if="voiceUrl" class="voice" @click.stop="toggleVoice">
			<view class="voice-icon">
				<view class="bar" :class="[playing ? 'bar-on' : '', 'b1']"></view>
				<view class="bar" :class="[playing ? 'bar-on' : '', 'b2']"></view>
				<view class="bar" :class="[playing ? 'bar-on' : '', 'b3']"></view>
				<view class="bar" :class="[playing ? 'bar-on' : '', 'b4']"></view>
			</view>
			<text class="voice-text">{{ playing ? '播放中…' : '语音消息' }}</text>
		</view>

		<!-- 定位 -->
		<view v-if="locationName" class="location" @click.stop="showMap">
			<view class="pin"></view>
			<text class="loc-name">{{ locationName }}</text>
		</view>

		<!-- 操作条 -->
		<view class="actions">
			<view class="action" :class="{ on: liked }" @click.stop="like">
				<text class="a-icon">{{ liked ? '♥' : '♡' }}</text>
				<text class="a-text">{{ liked ? '已赞' : '点赞' }}</text>
				<text v-if="likeCount" class="a-num">{{ likeCount }}</text>
			</view>
			<view class="action" @click.stop="goDetail">
				<text class="a-icon">⌾</text>
				<text class="a-text">评论</text>
				<text v-if="commentCount" class="a-num">{{ commentCount }}</text>
			</view>
			<view class="action" :class="{ on: favorited }" @click.stop="favorite">
				<text class="a-icon">{{ favorited ? '★' : '☆' }}</text>
				<text class="a-text">{{ favorited ? '已藏' : '收藏' }}</text>
			</view>
			<view class="action" @click.stop="share">
				<text class="a-icon">↗</text>
				<text class="a-text">分享</text>
			</view>
		</view>

		<!-- 评论区入口 -->
		<view v-if="commentCount" class="comments" @click.stop="goDetail">
			<text class="cm-tip">查看 {{ commentCount }} 条评论 ›</text>
		</view>
	</view>
</template>

<script>
	import { postApi } from '@/common/api.js'
	import { useUserStore } from '@/store/user.js'
	import { formatTime } from '@/common/format.js'

	export default {
		name: 'content-card',
		props: {
			content: {
				type: Object,
				required: true
			},
			inDetail: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				expanded: false,
				playing: false,
				innerAudio: null
			}
		},
		computed: {
			/* 用户信息直接来自 content，无需查 store */
			nickname() {
				return this.content.username || '无名书友'
			},
			avatarBg() {
				if (this.content.avatar) return 'transparent'
				const key = String(this.content.userId || '')
				const colors = ['#07C160', '#576B95', '#E6A23C', '#5B8FF9', '#9254DE', '#FF7A45']
				let h = 0
				for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 997
				return colors[h % colors.length]
			},
			timeText() {
				return formatTime(this.content.createTime)
			},
			isMine() {
				if (!this.userStore.user) return false
				const me = this.userStore.user.userId || this.userStore.user.id
				return String(this.content.userId) === String(me)
			},

			/* 正文 */
			text() {
				return this.content.content || ''
			},

			/* 图片：后端字段 pictures */
			images() {
				return Array.isArray(this.content.pictures) ? this.content.pictures : []
			},

			/* 语音：后端只返回 URL 字符串，无 duration/path */
			voiceUrl() {
				return this.content.voice || ''
			},

			/* 定位：后端 location 是名称字符串，latitude/longitude 独立 */
			locationName() {
				return this.content.location || ''
			},

			/* 互动计数 */
			liked() { return !!this.content.liked },
			favorited() { return !!this.content.favorited },
			likeCount() { return Number(this.content.likeCount) || 0 },
			favoriteCount() { return Number(this.content.favoriteCount) || 0 },
			commentCount() { return Number(this.content.commentCount) || 0 }
		},
		created() {
			this.userStore = useUserStore()
		},
		beforeUnmount() {
			if (this.innerAudio) {
				this.innerAudio.destroy()
				this.innerAudio = null
			}
		},
		methods: {
			goDetail() {
				if (this.inDetail) return
				uni.navigateTo({
					url: '/pages/detail/detail?id=' + this.content.id
				})
			},
			preview(index) {
				uni.previewImage({
					current: index,
					urls: this.images
				})
			},

			/**
			 * 点赞：直接调接口，乐观更新传入的 content 对象
			 */
			async like() {
				const c = this.content
				const wasLiked = !!c.liked
				c.liked = !wasLiked
				c.likeCount = Math.max(0, (Number(c.likeCount) || 0) + (wasLiked ? -1 : 1))
				try {
					await postApi.like(c.id)
				} catch (e) {
					c.liked = wasLiked
					c.likeCount = Math.max(0, (Number(c.likeCount) || 0) + (wasLiked ? 1 : -1))
					uni.showToast({ title: '点赞失败，请稍后再试', icon: 'none' })
				}
			},

			/**
			 * 收藏：直接调接口，乐观更新传入的 content 对象
			 */
			async favorite() {
				const c = this.content
				const wasFav = !!c.favorited
				c.favorited = !wasFav
				c.favoriteCount = Math.max(0, (Number(c.favoriteCount) || 0) + (wasFav ? -1 : 1))
				try {
					await postApi.favorite(c.id)
				} catch (e) {
					c.favorited = wasFav
					c.favoriteCount = Math.max(0, (Number(c.favoriteCount) || 0) + (wasFav ? 1 : -1))
					uni.showToast({ title: '收藏失败，请稍后再试', icon: 'none' })
				}
			},

			share() {
				const c = this.content
				const text = '「' + (this.text ? this.text.slice(0, 30) : '贤书·置换') + '」 来自 贤书·置换'
				uni.showActionSheet({
					itemList: ['复制内容分享', '转发给书友'],
					success: (res) => {
						if (res.tapIndex === 0) {
							uni.setClipboardData({
								data: text,
								success: () => {
									uni.showToast({ title: '已复制，去分享吧', icon: 'none' })
								}
							})
						} else {
							uni.showToast({ title: '已记下你的分享', icon: 'none' })
						}
					}
				})
			},

			toggleVoice() {
				if (!this.voiceUrl) return
				if (!this.innerAudio) {
					this.innerAudio = uni.createInnerAudioContext()
					this.innerAudio.onEnded(() => { this.playing = false })
				}
				if (this.playing) {
					this.innerAudio.stop()
					this.playing = false
					return
				}
				this.innerAudio.src = this.voiceUrl
				this.innerAudio.play()
				this.playing = true
			},

			showMap() {
				if (!this.locationName) return
				uni.openLocation({
					latitude: Number(this.content.latitude) || 30.27,
					longitude: Number(this.content.longitude) || 120.15,
					name: this.locationName,
					address: ''
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.cc {
		padding: 28rpx 30rpx 10rpx;
		margin-bottom: 20rpx;
	}

	/* 头部 */
	.head {
		display: flex;
		align-items: center;
	}
	.avatar {
		width: 88rpx;
		height: 88rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		overflow: hidden;
		box-shadow: inset 0 -6rpx 12rpx rgba(0, 0, 0, 0.12);
	}
	.avatar-img {
		width: 100%;
		height: 100%;
	}
	.avatar-text {
		color: #FFFFFF;
		font-size: 40rpx;
		font-weight: 600;
	}
	.head-info {
		margin-left: 22rpx;
		flex: 1;
		min-width: 0;
	}
	.name-row {
		display: flex;
		align-items: center;
	}
	.nick {
		font-size: 32rpx;
		font-weight: 600;
		color: $ink;
	}
	.tag-mine {
		margin-left: 12rpx;
		font-size: 20rpx;
		color: #fff;
		background: $cinnabar;
		padding: 2rpx 12rpx;
		border-radius: 6rpx;
	}
	.time {
		display: block;
		margin-top: 6rpx;
		font-size: 24rpx;
		color: $ink-soft;
	}
	.loc {
		margin-left: 16rpx;
		color: $stone;
	}

	/* 正文 */
	.body-text {
		margin-top: 20rpx;
		font-size: 30rpx;
		line-height: 1.8;
		color: #191919;
		word-break: break-all;
		white-space: pre-wrap;
	}
	.more {
		color: $cinnabar;
		margin-left: 10rpx;
	}

	/* 九宫格 */
	.grid {
		display: flex;
		flex-wrap: wrap;
		margin-top: 20rpx;
	}
	.grid-item {
		width: calc((100% - 16rpx) / 3);
		height: 216rpx;
		margin-right: 8rpx;
		margin-bottom: 8rpx;
		border-radius: 10rpx;
		overflow: hidden;
		background: $paper-deep;
	}
	.grid-item:nth-child(3n) { margin-right: 0; }
	.grid-img {
		width: 100%;
		height: 100%;
	}
	.grid-single {
		width: 460rpx;
		height: 460rpx;
		margin-right: 0;
	}
	.grid-half {
		width: calc((100% - 8rpx) / 2);
		height: 300rpx;
	}
	.grid-half:nth-child(2n) { margin-right: 0; }

	/* 语音条 */
	.voice {
		margin-top: 20rpx;
		display: inline-flex;
		align-items: center;
		padding: 16rpx 30rpx;
		background: $paper-deep;
		border-radius: 999rpx;
	}
	.voice-icon {
		display: flex;
		align-items: flex-end;
		height: 36rpx;
		margin-right: 18rpx;
	}
	.bar {
		width: 6rpx;
		margin-right: 6rpx;
		background: $ink-soft;
		border-radius: 4rpx;
		height: 12rpx;
	}
	.b1 { height: 16rpx; }
	.b2 { height: 30rpx; }
	.b3 { height: 22rpx; }
	.b4 { height: 12rpx; }
	.bar-on {
		background: $cinnabar;
		animation: wave 0.8s ease-in-out infinite;
	}
	.bar-on.b2 { animation-delay: 0.1s; }
	.bar-on.b3 { animation-delay: 0.2s; }
	.bar-on.b4 { animation-delay: 0.3s; }
	@keyframes wave {
		0%, 100% { transform: scaleY(0.6); }
		50% { transform: scaleY(1.4); }
	}
	.voice-text {
		font-size: 26rpx;
		color: $ink;
	}

	/* 定位 */
	.location {
		margin-top: 18rpx;
		display: flex;
		align-items: center;
		align-self: flex-start;
	}
	.pin {
		width: 20rpx;
		height: 20rpx;
		border: 4rpx solid $stone;
		border-radius: 50% 50% 50% 0;
		transform: rotate(-45deg);
		margin-right: 14rpx;
		margin-bottom: 4rpx;
		flex-shrink: 0;
	}
	.loc-name {
		font-size: 26rpx;
		color: $stone;
	}

	/* 操作条 */
	.actions {
		display: flex;
		align-items: center;
		margin-top: 22rpx;
		padding-top: 18rpx;
		border-top: 1rpx solid $uni-border-color;
	}
	.action {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		color: $ink-soft;
		font-size: 26rpx;
	}
	.action.on { color: $cinnabar; }
	.a-icon {
		font-size: 34rpx;
		margin-right: 8rpx;
		line-height: 1;
	}
	.a-num {
		margin-left: 8rpx;
		font-size: 24rpx;
		color: $ink-soft;
	}

	/* 评论 */
	.comments {
		margin-top: 16rpx;
		background: $paper-deep;
		border-radius: 10rpx;
		padding: 14rpx 18rpx;
	}
	.cm-tip {
		font-size: 26rpx;
		color: $ink-soft;
		letter-spacing: 2rpx;
	}
</style>