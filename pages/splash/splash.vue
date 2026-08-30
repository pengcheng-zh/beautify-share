<template>
	<view class="splash" @click="enter">
		<view class="frame">
			<view class="corner corner-tl"></view>
			<view class="corner corner-tr"></view>
			<view class="corner corner-bl"></view>
			<view class="corner corner-br"></view>

			<!-- 竖排逐字 -->
			<view class="verse">
				<view
					v-for="(ch, i) in chars"
					:key="i"
					class="char"
					:style="{ animationDelay: (0.8 + i * 0.35) + 's' }"
				>{{ ch }}</view>
			</view>

			<text class="brand-name">贤书 · 找书 · 换书</text>
		</view>
	</view>
</template>

<script>
	import { useUserStore } from '@/store/user.js'

	export default {
		data() {
			return {
				chars: ['人', '间', '烟', '火', '，', '书', '市', '清', '灵', '。'],
				entered: false
			}
		},
		onLoad() {
			setTimeout(() => {
				this.goHome()
			}, 5200)
		},
		methods: {
			enter() {
				this.goHome()
			},
			goHome() {
				if (this.entered) return
				this.entered = true
				const userStore = useUserStore()
				if (!userStore.user) userStore.login()
				const g = userStore.user ? userStore.user.gender : ''
				uni.reLaunch({
					url: g === 'male' || g === 'female'
						? '/pages/tabBar/books/books'
						: '/pages/onboard/gender/gender'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.splash {
		position: relative;
		width: 100vw;
		height: 100vh;
		background: linear-gradient(160deg, #f4eedf 0%, #ece2cb 55%, #e4d6b8 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	/* 水墨圆环水印 */
	.splash::before {
		content: '';
		position: absolute;
		width: 900rpx;
		height: 900rpx;
		border-radius: 50%;
		border: 2rpx solid rgba(7, 193, 96, 0.10);
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		box-shadow:
			inset 0 0 0 60rpx rgba(7, 193, 96, 0.02),
			inset 0 0 0 120rpx rgba(7, 193, 96, 0.02),
			inset 0 0 0 180rpx rgba(7, 193, 96, 0.02);
	}

	.frame {
		position: relative;
		width: 80%;
		height: 82%;
		border: 2rpx solid rgba(0, 0, 0, 0.35);
		border-radius: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 50rpx 0 44rpx;
		box-sizing: border-box;
	}

	.corner {
		position: absolute;
		width: 44rpx;
		height: 44rpx;
		border-color: $cinnabar;
	}
	.corner-tl { top: -4rpx; left: -4rpx; border-top: 4rpx solid; border-left: 4rpx solid; }
	.corner-tr { top: -4rpx; right: -4rpx; border-top: 4rpx solid; border-right: 4rpx solid; }
	.corner-bl { bottom: -4rpx; left: -4rpx; border-bottom: 4rpx solid; border-left: 4rpx solid; }
	.corner-br { bottom: -4rpx; right: -4rpx; border-bottom: 4rpx solid; border-right: 4rpx solid; }

	.brand-name {
		position: absolute;
		bottom: 44rpx;
		left: 0;
		right: 0;
		text-align: center;
		font-size: 30rpx;
		letter-spacing: 10rpx;
		color: $ink;
		text-indent: 10rpx;
		animation: fadeUp 1s 0.4s ease both;
	}

	/* 竖排逐字 */
	.verse {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 6rpx 0;
	}

	.char {
		font-size: 60rpx;
		line-height: 1.4;
		color: $ink;
		font-weight: 600;
		opacity: 0;
		transform: translateY(26rpx);
		animation: charIn 0.7s ease forwards;
		text-shadow: 0 2rpx 0 rgba(255, 255, 255, 0.4);
	}

	@keyframes charIn {
		from {
			opacity: 0;
			transform: translateY(26rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes fadeUp {
		from {
			opacity: 0;
			transform: translateY(18rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
