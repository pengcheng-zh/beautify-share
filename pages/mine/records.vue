<template>
	<view class="page">
		<!-- 状态筛选 -->
		<view class="tabs">
			<view
				v-for="(t, i) in tabs"
				:key="i"
				class="tab"
				:class="{ on: current === i }"
				@click="current = i"
			>
				{{ t.name }}
				<text v-if="t.count" class="tab-count">{{ t.count }}</text>
			</view>
		</view>

		<view class="list">
			<view v-for="c in filtered" :key="c.id" class="wrap">
				<view class="status-tag" :class="statusClass(c.status)">{{ statusText(c.status) }}</view>
				<content-card :content="c" />
			</view>

			<view v-if="!filtered.length" class="empty">
				<text class="empty-char">空</text>
				<text class="empty-text">{{ current === 1 ? '暂无待审核的书帖' : '这里还没有书帖' }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { useContentStore } from '@/store/content.js'
	import { statusText, statusClass } from '@/common/format.js'
	import contentCard from '@/components/content-card/content-card.vue'

	export default {
		components: {
			contentCard
		},
		data() {
			return {
				current: 0
			}
		},
		computed: {
			contentStore() {
				return this._store
			},
			myContents() {
				return this._store ? this._store.myContents() : []
			},
			tabs() {
				return [
					{ name: '全部', count: this.myContents.length },
					{ name: '待审核', count: this.myContents.filter((c) => c.status === 'pending').length },
					{ name: '已通过', count: this.myContents.filter((c) => c.status === 'approved').length },
					{ name: '未通过', count: this.myContents.filter((c) => c.status === 'rejected').length }
				]
			},
			filtered() {
				if (this.current === 0) return this.myContents
				const map = { 1: 'pending', 2: 'approved', 3: 'rejected' }
				return this.myContents.filter((c) => c.status === map[this.current])
			}
		},
		created() {
			this._store = useContentStore()
		},
		onLoad(options) {
			this._store = useContentStore()
			this._store.init()
			this.current = Number(options.tab || 0)
		},
		methods: {
			statusText,
			statusClass
		}
	}
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100vh;
		box-sizing: border-box;
	}

	.tabs {
		display: flex;
		background: $paper-light;
		padding: 20rpx 12rpx;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.tab {
		flex: 1;
		text-align: center;
		font-size: 28rpx;
		color: $ink-soft;
		padding: 14rpx 0;
		border-radius: 999rpx;
		position: relative;
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

	.wrap {
		position: relative;
	}

	.status-tag {
		position: absolute;
		top: 14rpx;
		left: 14rpx;
		z-index: 5;
		font-size: 22rpx;
		color: #FFFFFF;
		padding: 4rpx 16rpx;
		border-radius: 999rpx;
		letter-spacing: 2rpx;
	}

	.st-pending { background: #FA9D3B; }
	.st-approved { background: #07C160; }
	.st-rejected { background: #9E9E9E; }

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
