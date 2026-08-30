<template>
	<view class="page">
		<view class="head">
			<text class="head-title">我的分享</text>
			<text class="head-sub">好书好书事，与人共赏之</text>
		</view>
		<view class="list">
			<content-card v-for="c in list" :key="c.id" :content="c" />
			<view v-if="!list.length" class="empty">
				<text class="empty-char">享</text>
				<text class="empty-text">还没有分享过的书帖</text>
			</view>
		</view>
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
		onShow() {
			this._store = useContentStore()
			this._store.init()
			this.list = this._store.myShared()
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
