<template>
	<view class="page">
		<view class="head">
			<text class="head-title">我的收藏</text>
			<text class="head-sub">藏于书箧，闲时细读</text>
		</view>
		<view class="list">
			<content-card v-for="c in list" :key="c.id" :content="c" />
			<view v-if="!list.length && !loading" class="empty">
				<text class="empty-char">藏</text>
				<text class="empty-text">还没有收藏的书帖</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { postApi } from '@/common/api.js'
	import contentCard from '@/components/content-card/content-card.vue'

	export default {
		components: {
			contentCard
		},
		data() {
			return {
				list: [],
				loading: false
			}
		},
		onShow() {
			this.loadList()
		},
		onUnload() {
			this.list = []
		},
		methods: {
			async loadList() {
				if (this.loading) return
				this.loading = true
				try {
					// 我收藏的书帖：GET /post/favorite-list
					const res = await postApi.favoriteList({ page: 1, pageSize: 50 })
					this.list = (res && res.data) || res.data || []
				} catch (e) {
					console.warn('[favorites] loadList failed', e)
				} finally {
					this.loading = false
				}
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

	.list {
		padding: 20rpx 24rpx;
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