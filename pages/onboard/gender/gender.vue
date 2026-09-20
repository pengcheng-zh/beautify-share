<template>
	<view class="page">
		<view class="title">选择你的性别</view>
		<view class="sub">用于个性化推荐，可稍后在资料中修改</view>

		<view class="options">
			<view class="option" :class="{ active: picked === genderEnum.MALE }" @click="pick(genderEnum.MALE)">
				<image class="opt-img" src="/static/male.png" mode="aspectFit" />
				<text class="opt-label">男</text>
			</view>
			<view class="option" :class="{ active: picked === genderEnum.FEMALE }" @click="pick(genderEnum.FEMALE)">
				<image class="opt-img" src="/static/female.png" mode="aspectFit" />
				<text class="opt-label">女</text>
			</view>
		</view>

		<view class="next" :class="{ disabled: !picked }" @click="confirm">下一步</view>
	</view>
</template>

<script>
	import { useUserStore, GENDER } from '@/store/user.js'
	import { authApi } from '@/common/api.js'

	export default {
		data() {
			return {
				picked: GENDER.UNKNOWN,
				genderEnum: GENDER
			}
		},
		onLoad() {
			this.userStore = useUserStore()
			// 重新拉一次用户信息，避免后端已设置 gender 但本地缓存仍为空
			this.userStore.silentLogin().then(() => {
				if (this.userStore.hasGender) {
					uni.reLaunch({ url: '/pages/tabBar/books/books' })
				}
			})
		},
		methods: {
			pick(g) {
				this.picked = g
			},
			async confirm() {
				if (!this.picked) {
					uni.showToast({ title: '请先选择性别', icon: 'none' })
					return
				}
				// 先落库再跳转：接口成功后更新本地缓存
				uni.showLoading({ title: '保存中', mask: true })
				try {
					await authApi.updateGender(this.picked)
					this.userStore.updateUser({ gender: this.picked })
					uni.hideLoading()
					uni.reLaunch({ url: '/pages/tabBar/books/books' })
				} catch (e) {
					uni.hideLoading()
					uni.showToast({
						title: (e && e.message) || '保存失败，请重试',
						icon: 'none'
					})
				}
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
