<template>
	<view class="page">
		<!-- 掌柜台标题 -->
		<view class="head">
			<text class="head-title">审核管理</text>
			<text class="head-sub">掌柜台 · 笔下有分寸，市间见清明</text>
		</view>

		<!-- 分类 -->
		<view class="tabs">
			<view class="tab" :class="{ on: tab === 0 }" @click="tab = 0">
				待审内容
				<text v-if="pendingContents.length" class="tab-count">{{ pendingContents.length }}</text>
			</view>
			<view class="tab" :class="{ on: tab === 1 }" @click="tab = 1">
				待审评论
				<text v-if="pendingComments.length" class="tab-count">{{ pendingComments.length }}</text>
			</view>
			<view class="tab" :class="{ on: tab === 2 }" @click="tab = 2">已处理</view>
		</view>

		<!-- 待审内容 -->
		<view v-if="tab === 0" class="list">
			<view v-for="c in pendingContents" :key="c.id" class="item card">
				<view class="i-head">
					<view class="i-avatar" :style="{ background: avatarColor(c.userId) }">{{ userName(c.userId).slice(0, 1) }}</view>
					<view class="i-info">
						<text class="i-nick">{{ userName(c.userId) }}</text>
						<text class="i-time">{{ formatTime(c.createTime) }}</text>
					</view>
				</view>
				<view v-if="c.text" class="i-text ellipsis-2">{{ c.text }}</view>
				<view v-if="c.images && c.images.length" class="i-thumbs">
					<image v-for="(img, k) in c.images.slice(0, 3)" :key="k" class="i-thumb" :src="img" mode="aspectFill" />
					<text v-if="c.images.length > 3" class="i-more">+{{ c.images.length - 3 }}</text>
				</view>
				<view class="i-meta">
					<text v-if="c.images.length" class="meta">图 {{ c.images.length }}</text>
					<text v-if="c.voice && c.voice.duration" class="meta">声 {{ c.voice.duration }}″</text>
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
				<view class="cm-title">评论「{{ contentBrief(cm.contentId) }}」</view>
				<view class="i-head">
					<view class="i-avatar" :style="{ background: avatarColor(cm.userId) }">{{ userName(cm.userId).slice(0, 1) }}</view>
					<view class="i-info">
						<text class="i-nick">{{ userName(cm.userId) }}</text>
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

		<!-- 已处理 -->
		<view v-if="tab === 2" class="list">
			<view v-for="c in handledContents" :key="'c' + c.id" class="item card">
				<view class="i-head">
					<view class="i-avatar" :style="{ background: avatarColor(c.userId) }">{{ userName(c.userId).slice(0, 1) }}</view>
					<view class="i-info">
						<text class="i-nick">{{ userName(c.userId) }}</text>
						<text class="i-time">{{ formatTime(c.createTime) }}</text>
					</view>
					<view class="h-status" :class="c.status">{{ c.status === 'approved' ? '已通过' : '已驳回' }}</view>
				</view>
				<view v-if="c.text" class="i-text ellipsis-2">{{ c.text }}</view>
				<view class="i-ops">
					<view class="op undo" @click="restoreContent(c)">撤销处理</view>
				</view>
			</view>
			<view v-for="cm in handledComments" :key="'m' + cm.id" class="item card">
				<view class="cm-title">评论「{{ contentBrief(cm.contentId) }}」</view>
				<view class="i-head">
					<view class="i-avatar" :style="{ background: avatarColor(cm.userId) }">{{ userName(cm.userId).slice(0, 1) }}</view>
					<view class="i-info">
						<text class="i-nick">{{ userName(cm.userId) }}</text>
						<text class="i-time">{{ formatTime(cm.createTime) }}</text>
					</view>
					<view class="h-status" :class="cm.status">{{ cm.status === 'approved' ? '已通过' : '已驳回' }}</view>
				</view>
				<view class="i-text">{{ cm.text }}</view>
				<view class="i-ops">
					<view class="op undo" @click="restoreComment(cm)">撤销处理</view>
				</view>
			</view>
			<view v-if="!handledContents.length && !handledComments.length" class="empty">
				<text class="empty-char">虚</text>
				<text class="empty-text">尚无处理记录</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { useContentStore } from '@/store/content.js'
	import { formatTime } from '@/common/format.js'

	const AVATAR_COLORS = ['#07C160', '#576B95', '#E6A23C', '#5B8FF9', '#9254DE', '#FF7A45']

	export default {
		data() {
			return {
				tab: 0
			}
		},
		computed: {
			pendingContents() {
				return this._store ? this._store.pendingContents : []
			},
			pendingComments() {
				return this._store ? this._store.pendingComments : []
			},
			handledContents() {
				return this._store
					? this._store.contents
							.filter((c) => c.status === 'approved' || c.status === 'rejected')
							.sort((a, b) => b.createTime - a.createTime)
					: []
			},
			handledComments() {
				return this._store
					? this._store.comments
							.filter((c) => c.status === 'approved' || c.status === 'rejected')
							.sort((a, b) => b.createTime - a.createTime)
					: []
			}
		},
		created() {
			this._store = useContentStore()
		},
		onLoad() {
			this._store = useContentStore()
			this._store.init()
		},
		methods: {
			avatarColor(uid) {
				let h = 0
				for (let i = 0; i < uid.length; i++) h = (h * 31 + uid.charCodeAt(i)) % 997
				return AVATAR_COLORS[h % AVATAR_COLORS.length]
			},
			userName(uid) {
				return this._store.getUser(uid).nickname
			},
			formatTime(ts) {
				return formatTime(ts)
			},
			contentBrief(id) {
				const c = this._store.getContent(id)
				if (!c) return '已删'
				return c.text ? c.text.slice(0, 18) + (c.text.length > 18 ? '…' : '') : '无文字'
			},
			passContent(c) {
				this._store.auditContent(c.id, 'approved')
				uni.showToast({ title: '已通过，可在书斋示人', icon: 'none' })
			},
			rejectContent(c) {
				this._store.auditContent(c.id, 'rejected')
				uni.showToast({ title: '已驳回', icon: 'none' })
			},
			passComment(cm) {
				this._store.auditComment(cm.id, 'approved')
				uni.showToast({ title: '评论已通过', icon: 'none' })
			},
			rejectComment(cm) {
				this._store.auditComment(cm.id, 'rejected')
				uni.showToast({ title: '评论已驳回', icon: 'none' })
			},
			restoreContent(c) {
				this._store.auditContent(c.id, 'pending')
				uni.showToast({ title: '已移回待审', icon: 'none' })
			},
			restoreComment(cm) {
				this._store.auditComment(cm.id, 'pending')
				uni.showToast({ title: '已移回待审', icon: 'none' })
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
