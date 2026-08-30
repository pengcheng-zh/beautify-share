<template>
	<view class="page">
		<view class="title">选择你的性别</view>
		<view class="sub">用于个性化推荐，可稍后在资料中修改</view>

		<view class="options">
			<view class="option" :class="{ active: picked === 'male' }" @click="pick('male')">
				<image class="opt-img" src="/static/male.png" mode="aspectFit" />
				<text class="opt-label">男</text>
			</view>
			<view class="option" :class="{ active: picked === 'female' }" @click="pick('female')">
				<image class="opt-img" src="/static/female.png" mode="aspectFit" />
				<text class="opt-label">女</text>
			</view>
		</view>

		<view class="next" :class="{ disabled: !picked }" @click="confirm">下一步</view>
	</view>
</template>

<script>
	import { useUserStore } from '@/store/user.js'

	export default {
		data() {
			return {
				picked: ''
			}
		},
		onLoad() {
			this.userStore = useUserStore()
			if (!this.userStore.user) this.userStore.login()
			if (this.userStore.user && this.userStore.user.gender) {
				uni.reLaunch({ url: '/pages/tabBar/books/books' })
			}
		},
		methods: {
			pick(g) {
				this.picked = g
			},
			confirm() {
				if (!this.picked) {
					uni.showToast({ title: '请先选择性别', icon: 'none' })
					return
				}
				this.userStore.updateUser({ gender: this.picked })
				uni.reLaunch({ url: '/pages/tabBar/books/books' })
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100vh;
		background: $paper;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0 60rpx 80rpx;
		box-sizing: border-box;
	}

	.title {
		font-size: 44rpx;
		font-weight: 600;
		color: $ink;
		letter-spacing: 4rpx;
	}

	.sub {
		margin-top: 16rpx;
		font-size: 26rpx;
		color: $ink-soft;
	}

	.options {
		margin-top: 90rpx;
		display: flex;
		width: 100%;
		justify-content: space-between;
	}

	.option {
		width: 260rpx;
		height: 300rpx;
		border-radius: 24rpx;
		border: 3rpx solid $uni-border-color;
		background: $paper-light;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.option.active {
		border-color: $cinnabar;
		box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.18);
	}

	.opt-img {
		width: 160rpx;
		height: 160rpx;
	}

	.opt-label {
		margin-top: 24rpx;
		font-size: 34rpx;
		color: $ink;
		letter-spacing: 6rpx;
	}

	.next {
		margin-top: 100rpx;
		width: 100%;
		text-align: center;
		padding: 26rpx 0;
		border-radius: 16rpx;
		background: $cinnabar;
		color: #FFFFFF;
		font-size: 32rpx;
		letter-spacing: 8rpx;
	}

	.next.disabled {
		opacity: 0.4;
	}
</style>
