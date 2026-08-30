<template>
	<view class="page">
		<!-- 顶部氛围 -->
		<view class="banner">
			<view class="banner-head">
				<text class="banner-title">闲书</text>
			</view>
			<text class="banner-sub">人间烟火，书市清灵。</text>
			<view class="banner-rule">
				<view class="rule-line"></view>
				<view class="rule-dot"></view>
				<view class="rule-line"></view>
			</view>
		</view>

		<!-- 信息流 -->
		<view v-if="list.length" class="feed">
			<content-card v-for="c in list" :key="c.id" :content="c" />
		</view>
		<view v-else class="empty">
			<text class="empty-char">空</text>
			<text class="empty-text">市集未开张，点右下角发一条吧</text>
		</view>

		<!-- 悬浮发布 -->
		<view class="fab" @click="goPublish">
			<text class="fab-plus">＋</text>
		</view>

		<view class="tab-placeholder"></view>
	</view>
</template>

<script>
	import { useContentStore } from '@/store/content.js'
	import contentCard from '@/components/content-card/content-card.vue'

	export default {
		components: {
			contentCard
		},
		data() {
			return {
				list: []
			}
		},
		onLoad() {
			this.contentStore = useContentStore()
			this.contentStore.init()
			this.refresh()
		},
		onShow() {
			if (this.contentStore) {
				this.contentStore.init()
				this.refresh()
			}
		},
		onPullDownRefresh() {
			this.contentStore.init()
			this.refresh()
			setTimeout(() => {
				uni.stopPullDownRefresh()
				uni.showToast({ title: '市集已刷新', icon: 'none' })
			}, 400)
		},
		onShareAppMessage() {
			return {
				title: '贤书·置换｜人间烟火，书市清灵',
				path: '/pages/tabBar/books/books'
			}
		},
		methods: {
			refresh() {
				this.list = this.contentStore.approvedContents
			},
			goPublish() {
				uni.navigateTo({
					url: '/pages/publish/publish'
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

	/* 顶部 */
	.banner {
		padding: 36rpx 40rpx 8rpx;
	}

	.banner-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.banner-title {
		font-size: 52rpx;
		font-weight: 700;
		color: $ink;
		letter-spacing: 8rpx;
	}

	.banner-sub {
		display: block;
		margin-top: 14rpx;
		font-size: 26rpx;
		color: $ink-soft;
		letter-spacing: 4rpx;
	}

	.banner-rule {
		display: flex;
		align-items: center;
		margin-top: 18rpx;
	}

	.rule-line {
		flex: 1;
		height: 2rpx;
		background: rgba(0, 0, 0, 0.18);
	}

	.rule-dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		background: $cinnabar;
		margin: 0 12rpx;
	}

	.feed {
		padding: 20rpx 24rpx 0;
	}

	/* 空态 */
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 160rpx 0;
	}

	.empty-char {
		width: 110rpx;
		height: 110rpx;
		border: 3rpx solid $ink-soft;
		border-radius: 12rpx;
		color: $ink-soft;
		font-size: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.4;
	}

	.empty-text {
		margin-top: 30rpx;
		color: $ink-soft;
		font-size: 26rpx;
	}

	/* 悬浮按钮 */
	.fab {
		position: fixed;
		right: 44rpx;
		bottom: 180rpx;
		width: 110rpx;
		height: 110rpx;
		border-radius: 50%;
		background: linear-gradient(145deg, $cinnabar-light, $cinnabar);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 12rpx 28rpx rgba(7, 193, 96, 0.45);
		z-index: 100;
		transition: transform 0.15s ease;
	}

	.fab:active {
		transform: scale(0.92);
	}

	.fab-plus {
		color: #FFFFFF;
		font-size: 60rpx;
		font-weight: 300;
		line-height: 1;
		margin-top: -6rpx;
	}

	.tab-placeholder {
		height: 40rpx;
	}
</style>
