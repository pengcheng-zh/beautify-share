<template>
	<view class="page">
		<!-- 顶部氛围 -->
		<view class="banner">
			<view class="banner-head">
				<view class="banner-center">
					<view class="center-rule"></view>
					<text class="banner-sub">人间烟火，书市清灵。</text>
					<view class="center-rule"></view>
				</view>
			</view>
			<view class="banner-rule">
				<view class="rule-line"></view>
				<view class="rule-dot"></view>
				<view class="rule-line"></view>
			</view>
		</view>

		<!-- 信息流 -->
		<view v-if="list.length" class="feed">
			<content-card v-for="c in list" :key="c.id" :content="c" />
			<view class="feed-foot">
				<text v-if="loading" class="foot-tip">载入中…</text>
				<text v-else-if="finished" class="foot-tip">— 已至书市尽头 —</text>
				<text v-else class="foot-tip foot-more" @click="loadMore">轻触加载更多</text>
			</view>
		</view>
		<view v-else-if="loading" class="empty">
			<text class="empty-text">市集开门中…</text>
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
				loading: false
			}
		},
		computed: {
			contentStore() {
				return this._store
			},
			list() {
				return this._store ? this._store.feed : []
			},
			finished() {
				return this._store ? !this._store.feedHasMore : true
			}
		},
		created() {
			this._store = useContentStore()
		},
		onLoad() {
			this._store = useContentStore()
			this.loadFirst()
		},
		onShow() {
			if (!this._store) {
				this._store = useContentStore()
			}
			// 进入首页时静默刷新一次，拉取最新内容
			this.refresh()
		},
		async onPullDownRefresh() {
			try {
				await this._store.refreshFeed()
				uni.showToast({ title: '市集已刷新', icon: 'none' })
			} finally {
				uni.stopPullDownRefresh()
			}
		},
		onReachBottom() {
			if (this.loading || this.finished) return
			this.loadMore()
		},
		onShareAppMessage() {
			return {
				title: '贤书·置换｜人间烟火，书市清灵',
				path: '/pages/tabBar/books/books'
			}
		},
		methods: {
			async loadFirst() {
				if (this.list.length) return
				this.loading = true
				try {
					await this._store.loadFeed({ page: 1, refresh: true })
				} finally {
					this.loading = false
				}
			},
			async refresh() {
				if (this.loading) return
				this.loading = true
				try {
					await this._store.refreshFeed()
				} finally {
					this.loading = false
				}
			},
			async loadMore() {
				if (this.loading || this.finished) return
				this.loading = true
				try {
					await this._store.loadFeed({ page: this._store.feedPage + 1 })
				} finally {
					this.loading = false
				}
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
		padding: 40rpx 44rpx 8rpx;
	}

	.banner-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	/* 左右两个大字 */
	.banner-char {
		font-size: 78rpx;
		font-weight: 700;
		line-height: 1;
		color: $ink;
		text-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.06);
	}

	/* 中间标语 */
	.banner-center {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 18rpx;
	}

	.center-rule {
		width: 40rpx;
		height: 2rpx;
		background: rgba(0, 0, 0, 0.15);
	}

	.banner-sub {
		margin: 0 14rpx;
		font-size: 26rpx;
		color: $ink-soft;
		letter-spacing: 4rpx;
		white-space: nowrap;
	}

	.banner-rule {
		display: flex;
		align-items: center;
		margin-top: 24rpx;
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

	.feed-foot {
		padding: 30rpx 0 20rpx;
		text-align: center;
	}

	.foot-tip {
		font-size: 24rpx;
		color: $ink-soft;
		letter-spacing: 4rpx;
	}

	.foot-more {
		color: $stone;
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
