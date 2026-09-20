<template>
	<view class="page">
		<!-- 状态筛选：每个 tab 都由后端按 status 返回，不再本地过滤 -->
		<view class="tabs">
			<view
				v-for="(t, i) in tabs"
				:key="i"
				class="tab"
				:class="{ on: current === i }"
				@click="switchTab(i)"
			>
				{{ t.name }}
			</view>
		</view>

		<view class="list">
			<view v-for="c in list" :key="c.id" class="wrap">
				<view v-if="statusText(c.status)" class="status-tag" :class="statusClass(c.status)">{{ statusText(c.status) }}</view>
				<content-card :content="c" />
			</view>

			<view v-if="!loading && !list.length" class="empty">
				<text class="empty-char">空</text>
				<text class="empty-text">{{ emptyText }}</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { postApi } from '@/common/api.js'
	import { statusText, statusClass } from '@/common/format.js'
	import contentCard from '@/components/content-card/content-card.vue'

	/**
	 * tab 索引 -> 后端 status 编码
	 *   0 全部  -> 不传 status
	 *   1 待审核 -> A
	 *   2 已通过 -> B（兼容 P）
	 *   3 未通过 -> C（兼容 R）
	 */
	const TAB_STATUS = ['', 'A', 'P', 'R']

	export default {
		components: {
			contentCard
		},
		data() {
			return {
				current: 0,
				list: [],
				loading: false
			}
		},
		computed: {
			tabs() {
				return [
					{ name: '全部' },
					{ name: '待审核' },
					{ name: '已通过' },
					{ name: '未通过' }
				]
			},
			emptyText() {
				return ['这里还没有书帖', '暂无待审核的书帖', '暂无已通过的书帖', '暂无未通过的书帖'][this.current]
			}
		},
		async onLoad(options) {
			this.current = Number(options.tab || 0)
			this.list = []
			await this.loadList()
		},
		onShow() {
			// 每次回到页面，刷新当前 tab 的真实数据
			this.loadList()
		},
		methods: {
			async switchTab(i) {
				if (this.current === i) return
				this.current = i
				this.list = []
				await this.loadList()
			},
			async loadList() {
				if (this.loading) return
				this.loading = true
				try {
					const status = TAB_STATUS[this.current] || ''
					const res = await postApi.mine({ page: 1, pageSize: 50, status })
					const arr = (res && (res.data))
						|| (Array.isArray(res.data) ? res.data : [])
					this.list = Array.isArray(arr) ? arr : []
				} catch (e) {
					console.warn('[records] loadList failed', e)
				} finally {
					this.loading = false
				}
			},
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