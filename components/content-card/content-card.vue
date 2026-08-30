<template>
	<view class="cc card" @click="goDetail">
		<!-- 头部 -->
		<view class="head">
			<view class="avatar" :style="{ background: avatarBg }">
				<image v-if="user.avatar" class="avatar-img" :src="user.avatar" mode="aspectFill" />
				<text v-else class="avatar-text">{{ nickname.slice(0, 1) }}</text>
			</view>
			<view class="head-info">
				<view class="name-row">
					<text class="nick">{{ nickname }}</text>
					<text v-if="isMine" class="tag-mine">我</text>
				</view>
				<text class="time">{{ timeText }}<text v-if="content.location" class="loc">{{ content.location.name }}</text></text>
			</view>
		</view>

		<!-- 正文 -->
		<view v-if="content.text" class="body-text" :class="{ 'with-more': !expanded && content.text.length > 90 }">
			<text>{{ content.text }}</text>
			<text v-if="!expanded && content.text.length > 90" class="more" @click.stop="expanded = true">全文</text>
		</view>

		<!-- 九宫格图片 -->
		<view v-if="content.images && content.images.length" class="grid" :class="'grid-n' + content.images.length">
			<view
				v-for="(img, i) in content.images"
				:key="i"
				class="grid-item"
				:class="{
					'grid-single': content.images.length === 1,
					'grid-half': content.images.length === 2
				}"
				@click.stop="preview(i)"
			>
				<image class="grid-img" :src="img" mode="aspectFill" lazy-load />
			</view>
		</view>

		<!-- 语音 -->
		<view v-if="content.voice && content.voice.duration" class="voice" @click.stop="toggleVoice">
			<view class="voice-icon">
				<view class="bar" :class="[playing ? 'bar-on' : '', 'b1']"></view>
				<view class="bar" :class="[playing ? 'bar-on' : '', 'b2']"></view>
				<view class="bar" :class="[playing ? 'bar-on' : '', 'b3']"></view>
				<view class="bar" :class="[playing ? 'bar-on' : '', 'b4']"></view>
			</view>
			<text class="voice-text">{{ playing ? '播放中…' : '语音 · ' + content.voice.duration + '″' }}</text>
		</view>

		<!-- 定位 -->
		<view v-if="content.location" class="location" @click.stop="showMap">
			<view class="pin"></view>
			<text class="loc-name">{{ content.location.name }}</text>
			<text v-if="content.location.address" class="loc-addr">{{ content.location.address }}</text>
		</view>

		<!-- 点赞名单 -->
		<view v-if="content.likes && content.likes.length" class="likers">
			<view class="likers-avatars">
				<view
					v-for="uid in content.likes.slice(0, 8)"
					:key="uid"
					class="liker-avatar"
					:style="{ background: avatarColor(uid) }"
				>{{ likerName(uid).slice(0, 1) }}</view>
			</view>
			<text class="likers-count">{{ content.likes.length }}</text>
		</view>

		<!-- 操作条 -->
		<view class="actions">
			<view class="action" :class="{ on: liked }" @click.stop="like">
				<text class="a-icon">{{ liked ? '♥' : '♡' }}</text>
				<text class="a-text">{{ liked ? '已赞' : '点赞' }}</text>
				<text v-if="content.likes.length" class="a-num">{{ content.likes.length }}</text>
			</view>
			<view class="action" @click.stop="comment">
				<text class="a-icon">⌾</text>
				<text class="a-text">评论</text>
				<text v-if="approvedComments.length" class="a-num">{{ approvedComments.length }}</text>
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

		<!-- 评论区 -->
		<view v-if="approvedComments.length" class="comments">
			<view v-for="cm in showComments" :key="cm.id" class="cm-item" @click.stop="goDetail">
				<text class="cm-nick">{{ cmName(cm.userId) }}：</text>
				<text class="cm-text">{{ cm.text }}</text>
			</view>
			<view v-if="approvedComments.length > 3 && !inDetail" class="cm-more" @click.stop="goDetail">
				查看全部 {{ approvedComments.length }} 条评论
			</view>
		</view>
	</view>
</template>

<script>
	import { useContentStore } from '@/store/content.js'
	import { useUserStore } from '@/store/user.js'
	import { formatTime } from '@/common/format.js'

	const AVATAR_COLORS = ['#07C160', '#576B95', '#E6A23C', '#5B8FF9', '#9254DE', '#FF7A45']

	function hashId(id) {
		let h = 0
		for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997
		return h
	}

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
			user() {
				return this.contentStore.getUser(this.content.userId)
			},
			nickname() {
				return this.user.nickname
			},
			avatarBg() {
				return AVATAR_COLORS[hashId(this.content.userId) % AVATAR_COLORS.length]
			},
			timeText() {
				return formatTime(this.content.createTime)
			},
			isMine() {
				return this.userStore.user && this.content.userId === this.userStore.user.id
			},
			liked() {
				return this.me && this.content.likes.indexOf(this.me.id) > -1
			},
			favorited() {
				return this.me && this.content.favs.indexOf(this.me.id) > -1
			},
			me() {
				return this.userStore.user
			},
			allComments() {
				return this.contentStore
					.getCommentsOf(this.content.id)
					.filter((c) => c.status === 'approved')
			},
			approvedComments() {
				return this.allComments
			},
			showComments() {
				return this.inDetail ? this.allComments : this.allComments.slice(0, 3)
			}
		},
		created() {
			this.contentStore = useContentStore()
			this.userStore = useUserStore()
		},
		beforeUnmount() {
			if (this.innerAudio) {
				this.innerAudio.destroy()
				this.innerAudio = null
			}
		},
		methods: {
			avatarColor(uid) {
				return AVATAR_COLORS[hashId(uid) % AVATAR_COLORS.length]
			},
			likerName(uid) {
				return this.contentStore.getUser(uid).nickname
			},
			cmName(uid) {
				return this.contentStore.getUser(uid).nickname
			},
			goDetail() {
				if (this.inDetail) return
				uni.navigateTo({
					url: '/pages/detail/detail?id=' + this.content.id
				})
			},
			preview(index) {
				uni.previewImage({
					current: index,
					urls: this.content.images
				})
			},
			like() {
				this.contentStore.toggleLike(this.content.id)
			},
			favorite() {
				this.contentStore.toggleFav(this.content.id)
			},
			comment() {
				this.goDetail()
			},
			share() {
				this.contentStore.recordShare(this.content.id)
				const c = this.content
				const text = '「' + (c.text ? c.text.slice(0, 30) : '贤书·置换') + '」 来自 贤书·置换'
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
				const v = this.content.voice
				if (!v || !v.duration) return
				if (!v.path) {
					uni.showToast({ title: '演示数据暂无音频', icon: 'none' })
					return
				}
				if (!this.innerAudio) {
					this.innerAudio = uni.createInnerAudioContext()
					this.innerAudio.onEnded(() => {
						this.playing = false
					})
				}
				if (this.playing) {
					this.innerAudio.stop()
					this.playing = false
					return
				}
				this.innerAudio.src = v.path
				this.innerAudio.play()
				this.playing = true
			},
			showMap() {
				if (!this.content.location) return
				uni.openLocation({
					latitude: this.content.location.lat || 30.27,
					longitude: this.content.location.lng || 120.15,
					name: this.content.location.name,
					address: this.content.location.address || ''
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

	.grid-item:nth-child(3n) {
		margin-right: 0;
	}

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

	.grid-half:nth-child(2n) {
		margin-right: 0;
	}

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

	.loc-addr {
		margin-left: 16rpx;
		font-size: 24rpx;
		color: $ink-soft;
	}

	/* 点赞名单 */
	.likers {
		margin-top: 20rpx;
		display: flex;
		align-items: center;
		background: $paper-deep;
		border-radius: 10rpx;
		padding: 14rpx 18rpx;
	}

	.likers-avatars {
		display: flex;
		flex: 1;
	}

	.liker-avatar {
		width: 44rpx;
		height: 44rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #FFFFFF;
		font-size: 22rpx;
		margin-right: -10rpx;
		border: 3rpx solid $paper;
	}

	.likers-count {
		font-size: 24rpx;
		color: $ink-soft;
		margin-left: 18rpx;
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

	.action.on {
		color: $cinnabar;
	}

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

	.cm-item {
		font-size: 26rpx;
		line-height: 1.8;
		color: #191919;
	}

	.cm-nick {
		color: $stone;
		font-weight: 600;
	}

	.cm-more {
		margin-top: 8rpx;
		font-size: 24rpx;
		color: $ink-soft;
	}
</style>
