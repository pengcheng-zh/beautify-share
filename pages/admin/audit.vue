<template>
	<view class="page">
		<!-- 掌柜台标题 -->
		<view class="head">
			<text class="head-title">审核管理</text>
			<text class="head-sub">掌柜台 · 笔下有分寸，市间见清明</text>
		</view>

		<!-- 分类 -->
		<view class="tabs">
			<view class="tab" :class="{ on: tab === 0 }" @click="switchTab(0)">
				待审内容
				<text v-if="pendingContents.length" class="tab-count">{{ pendingContents.length }}</text>
			</view>
			<view class="tab" :class="{ on: tab === 1 }" @click="switchTab(1)">
				待审评论
				<text v-if="pendingComments.length" class="tab-count">{{ pendingComments.length }}</text>
			</view>
		</view>

		<!-- 待审内容 -->
		<view v-if="tab === 0" class="list">
			<view v-for="c in pendingContents" :key="c.id" class="item card">
				<view class="i-head">
					<view class="i-avatar" :style="{ background: avatarColor(c.userId) }">{{ nick(c).slice(0, 1) }}</view>
					<view class="i-info">
						<text class="i-nick">{{ nick(c) }}</text>
						<text class="i-time">{{ formatTime(c.createTime) }}</text>
					</view>
				</view>
				<view v-if="c.content" class="i-text ellipsis-2">{{ c.content }}</view>
				<view v-if="c.pictures && c.pictures.length" class="i-thumbs">
					<image v-for="(img, k) in c.pictures" :key="k" class="i-thumb" :src="img" mode="aspectFill" />
				</view>
				<!-- 语音：点击即可播放，再点停止 -->
				<view v-if="c.voice" class="i-voice" @click.stop="toggleVoice(c)">
					<view class="voice-icon">
						<view class="bar" :class="{ 'bar-on': playingId === c.id }"></view>
						<view class="bar" :class="{ 'bar-on': playingId === c.id }"></view>
						<view class="bar" :class="{ 'bar-on': playingId === c.id }"></view>
						<view class="bar" :class="{ 'bar-on': playingId === c.id }"></view>
					</view>
					<text class="voice-text">{{ playingId === c.id ? '播放中…' : '收听语音' }}</text>
				</view>
				<view class="i-meta">
					<text v-if="c.pictures && c.pictures.length" class="meta">图 {{ c.pictures.length }}</text>
					<text v-if="c.voice" class="meta">声</text>
					<text v-if="c.location" class="meta loc-meta">{{ c.location.name }}</text>
				</view>
				<view class="i-ops">
					<view class="op pass" @click="passContent(c)">通过</view>
					<view class="op reject" @click="rejectContent(c)">驳回</view>
				</view>
			</view>
			<view v-if="!pendingContents.length" class="empty">
				<text class="empty-char">清</text>
				<text class="empty-text">待审内容为空，市间清净</text>
			</view>
		</view>

		<!-- 待审评论 -->
		<view v-if="tab === 1" class="list">
			<view v-for="cm in pendingComments" :key="cm.id" class="item card">
				<view class="cm-title">评论「{{ contentBrief(cm.postId) }}」</view>
				<view class="i-head">
					<view class="i-avatar" :style="{ background: avatarColor(cm.userId) }">{{ nick(cm).slice(0, 1) }}</view>
					<view class="i-info">
						<text class="i-nick">{{ nick(cm) }}</text>
						<text class="i-time">{{ formatTime(cm.createTime) }}</text>
					</view>
				</view>
				<view class="i-text">{{ cm.text }}</view>
				<view class="i-ops">
					<view class="op pass" @click="passComment(cm)">通过</view>
					<view class="op reject" @click="rejectComment(cm)">驳回</view>
				</view>
			</view>
			<view v-if="!pendingComments.length" class="empty">
				<text class="empty-char">清</text>
				<text class="empty-text">待审评论为空</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { adminApi } from '@/common/api.js'
	import { formatTime } from '@/common/format.js'

	const AVATAR_COLORS = ['#07C160', '#576B95', '#E6A23C', '#5B8FF9', '#9254DE', '#FF7A45']

	export default {
		data() {
			return {
				tab: 0,
				// 三个 tab 各自实时拉取，不在本地做状态过滤
				pendingContents: [],
				pendingComments: [],
				// 当前正在播放的语音 id（用 data 集中管理，避免逐条记录状态）
				playingId: null,
				innerAudio: null
			}
		},
		onLoad(options) {
			this.tab = Number(options.tab || 0)
			this.loadCurrent()
		},
		onShow() {
			this.loadCurrent()
		},
		onUnload() {
			this._destroyAudio()
		},
		methods: {
			// 切换 tab：实时请求当前 tab 对应的接口
			switchTab(i) {
				if (this.tab === i) return
				this.tab = i
				this.loadCurrent()
			},
			loadCurrent() {
				if (this.tab === 0) {
					this.loadPendingContents()
				} else if (this.tab === 1) {
					this.loadPendingComments()
				} else {
					this.loadHandled()
				}
			},
			// 待审内容：GET /admin/post/list
			async loadPendingContents() {
				try {
					const res = await adminApi.postList({ page: 1, pageSize: 50 })
					this.pendingContents = (res && res.data) || res.data || []
					console.log('[audit] loadPendingContents', this.pendingContents)
				} catch (e) {
					console.warn('[audit] loadPendingContents failed', e)
				}
			},
			// 待审评论：GET /admin/comment/list
			async loadPendingComments() {
				try {
					const res = await adminApi.commentList({ page: 1, pageSize: 50 })
					this.pendingComments = (res && res.data) || res.data || []
				} catch (e) {
					console.warn('[audit] loadPendingComments failed', e)
				}
			},
			nick(item) {
				return item.username || '书友'
			},
			avatarColor(uid) {
				let h = 0
				const s = String(uid)
				for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997
				return AVATAR_COLORS[h % AVATAR_COLORS.length]
			},
			formatTime(ts) {
				return formatTime(ts)
			},
			contentBrief(postId) {
				const pool = this.pendingContents
				const found = pool.find((c) => String(c.id) === String(postId))
				if (found && found.text) {
					return found.text.length > 10 ? found.text.slice(0, 10) + '…' : found.text
				}
				return '已删'
			},
			/**
			 * 语音播放/停止：单例 InnerAudioContext，playingId 记录当前正在播放的条目
			 */
			toggleVoice(c) {
				if (!c || !c.voice) return
				// 当前条目正在播：点一下停止
				if (this.playingId === c.id) {
					this._stopAudio()
					return
				}
				// 切换到新条目前先停止旧播放
				this._stopAudio()
				if (!this.innerAudio) {
					this.innerAudio = uni.createInnerAudioContext()
					this.innerAudio.onEnded(() => { this.playingId = null })
					this.innerAudio.onStop(() => { this.playingId = null })
					this.innerAudio.onError((err) => {
						console.warn('[audit] voice play error', err)
						this.playingId = null
					})
				}
				this.innerAudio.src = c.voice
				this.innerAudio.play()
				this.playingId = c.id
			},
			_stopAudio() {
				if (this.innerAudio) {
					try { this.innerAudio.stop() } catch (e) {}
				}
				this.playingId = null
			},
			_destroyAudio() {
				if (this.innerAudio) {
					try { this.innerAudio.destroy() } catch (e) {}
					this.innerAudio = null
				}
				this.playingId = null
			},
			// 书帖审核：P=通过, R=驳回，成功后刷新实时列表
			async passContent(c) {
				await this.auditPost(c, 'P')
			},
			async rejectContent(c) {
				const reason = await this.askReason()
				if (reason === null) return
				await this.auditPost(c, 'R', reason)
			},
			async auditPost(c, status, reason) {
				if (!c) return
				try {
					await adminApi.postAudit({ id: c.id, status, reason })
					uni.showToast({ title: status === 'P' ? '已通过' : '已驳回', icon: 'success' })
					if (this.playingId === c.id) this._stopAudio()
					this.loadPendingContents()
				} catch (e) {
					uni.showToast({ title: (e && e.message) || '操作失败', icon: 'none' })
				}
			},
			// 评论审核：P=通过, R=驳回，成功后刷新实时列表
			async passComment(cm) {
				await this.auditComment(cm, 'P')
			},
			async rejectComment(cm) {
				const reason = await this.askReason()
				if (reason === null) return
				await this.auditComment(cm, 'R', reason)
			},
			async auditComment(cm, status, reason) {
				if (!cm) return
				try {
					await adminApi.commentAudit({ id: cm.id, status, reason })
					uni.showToast({ title: status === 'P' ? '已通过' : '已驳回', icon: 'success' })
					this.loadPendingComments()
				} catch (e) {
					uni.showToast({ title: (e && e.message) || '操作失败', icon: 'none' })
				}
			},
			// 驳回原因输入弹窗：取消返回 null，确认返回输入内容（可为空串）
			askReason() {
				return new Promise((resolve) => {
					uni.showModal({
						title: '填写驳回原因',
						editable: true,
						placeholderText: '驳回原因（可选）',
						success: (res) => resolve(res.confirm ? (res.content || '') : null),
						fail: () => resolve(null)
					})
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100vh;
		box-sizing: border-box;
	}

	.head {
		padding: 34rpx 40rpx 10rpx;
	}

	.head-title {
		font-size: 38rpx;
		font-weight: 700;
		color: $ink;
		letter-spacing: 4rpx;
	}

	.head-sub {
		display: block;
		margin-top: 10rpx;
		font-size: 24rpx;
		color: $ink-soft;
	}

	.tabs {
		display: flex;
		background: $paper-light;
		padding: 20rpx 12rpx;
	}

	.tab {
		flex: 1;
		text-align: center;
		font-size: 28rpx;
		color: $ink-soft;
		padding: 14rpx 0;
		border-radius: 999rpx;
	}

	.tab.on {
		color: #FFFFFF;
		background: linear-gradient(145deg, $cinnabar-light, $cinnabar);
		font-weight: 600;
		box-shadow: 0 6rpx 16rpx rgba(7, 193, 96, 0.3);
	}

	.tab-count {
		margin-left: 6rpx;
		font-size: 22rpx;
	}

	.list {
		padding: 20rpx 24rpx;
	}

	.item {
		padding: 26rpx 28rpx;
		margin-bottom: 20rpx;
	}

	.i-head {
		display: flex;
		align-items: center;
	}

	.i-avatar {
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

	.i-info {
		margin-left: 18rpx;
		flex: 1;
		min-width: 0;
	}

	.i-nick {
		display: block;
		font-size: 28rpx;
		font-weight: 600;
		color: $ink;
	}

	.i-time {
		display: block;
		margin-top: 4rpx;
		font-size: 22rpx;
		color: $ink-soft;
	}

	.i-text {
		margin-top: 18rpx;
		font-size: 28rpx;
		color: #191919;
		line-height: 1.7;
		word-break: break-all;
	}

	.cm-title {
		font-size: 24rpx;
		color: $ink-soft;
		margin-bottom: 14rpx;
		background: $paper-deep;
		padding: 8rpx 16rpx;
		border-radius: 8rpx;
	}

	.i-thumbs {
		display: flex;
		margin-top: 16rpx;
	}

	.i-thumb {
		width: 120rpx;
		height: 120rpx;
		border-radius: 8rpx;
		margin-right: 10rpx;
	}

	.i-more {
		width: 120rpx;
		height: 120rpx;
		background: $paper-deep;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
		color: $ink-soft;
	}

	/* 语音条 */
	.i-voice {
		margin-top: 18rpx;
		display: inline-flex;
		align-items: center;
		padding: 12rpx 24rpx;
		background: $paper-deep;
		border-radius: 999rpx;
	}

	.voice-icon {
		display: flex;
		align-items: flex-end;
		height: 28rpx;
		margin-right: 14rpx;
	}

	.voice-icon .bar {
		width: 6rpx;
		margin-right: 4rpx;
		background: $ink-soft;
		border-radius: 4rpx;
		transition: height 0.2s ease;
	}

	.voice-icon .bar.b1 { height: 10rpx; }
	.voice-icon .bar.b2 { height: 18rpx; }
	.voice-icon .bar.b3 { height: 14rpx; }
	.voice-icon .bar.b4 { height: 8rpx; }

	.voice-icon .bar.bar-on { animation: barBounce 0.9s ease-in-out infinite; }
	.voice-icon .bar.bar-on.b2 { animation-delay: 0.15s; }
	.voice-icon .bar.bar-on.b3 { animation-delay: 0.30s; }
	.voice-icon .bar.bar-on.b4 { animation-delay: 0.45s; }

	@keyframes barBounce {
		0%, 100% { height: 6rpx; background: $cinnabar; }
		50% { height: 26rpx; background: $cinnabar; }
	}

	.voice-text {
		font-size: 24rpx;
		color: $ink-soft;
	}

	.i-meta {
		display: flex;
		margin-top: 14rpx;
	}

	.meta {
		font-size: 22rpx;
		color: $stone;
		background: rgba(7, 193, 96, 0.1);
		padding: 4rpx 14rpx;
		border-radius: 6rpx;
		margin-right: 12rpx;
	}

	.i-ops {
		display: flex;
		justify-content: flex-end;
		margin-top: 20rpx;
		padding-top: 18rpx;
		border-top: 1rpx solid $uni-border-color;
	}

	.op {
		font-size: 26rpx;
		padding: 10rpx 34rpx;
		border-radius: 999rpx;
		margin-left: 16rpx;
	}

	.pass {
		background: $stone;
		color: #FFFFFF;
	}

	.reject {
		background: $paper-deep;
		color: $cinnabar;
		border: 1rpx solid rgba(7, 193, 96, 0.4);
	}

	.undo {
		background: $paper-deep;
		color: $ink-soft;
	}

	.h-status {
		font-size: 22rpx;
		padding: 4rpx 16rpx;
		border-radius: 999rpx;
	}

	.h-status.approved {
		background: rgba(107, 139, 110, 0.15);
		color: #4a7a4e;
	}

	.h-status.rejected {
		background: rgba(158, 158, 158, 0.2);
		color: #777;
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 140rpx 0;
	}

	.empty-char {
		width: 100rpx;
		height: 100rpx;
		border: 3rpx solid $ink-soft;
		border-radius: 12rpx;
		color: $ink-soft;
		font-size: 54rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.4;
	}

	.empty-text {
		margin-top: 26rpx;
		color: $ink-soft;
		font-size: 26rpx;
	}
</style>
