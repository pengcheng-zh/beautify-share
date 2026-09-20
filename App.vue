<script>
	import { useUserStore } from '@/store/user.js'

	function runSilentLogin(reason) {
		try {
			const userStore = useUserStore()
			// 已存在用户信息（来自本地缓存或上一次静默登录）则跳过，
			// 避免每次回到前台都重复请求 /auth/login
			if (userStore && userStore.user) {
				console.log('[silentLogin] skip, user exists:', userStore.user.id)
				return
			}
			console.log('[silentLogin] trigger by', reason)
			const p = userStore.silentLogin()
			if (p && typeof p.then === 'function') {
				p.then((u) => {
					console.log('[silentLogin] done', u && u.id)
				}).catch((err) => {
					console.warn('[silentLogin] failed', err)
				})
			}
		} catch (err) {
			console.error('[silentLogin] sync error', err)
		}
	}

	export default {
		onLaunch: function() {
			console.log('贤书·置换 App Launch')
			runSilentLogin('onLaunch')
		},
		onShow: function() {
			console.log('贤书·置换 App Show')
			// 从后台切回前台也补一次，确保用户信息最新
			runSilentLogin('onShow')
		},
		onHide: function() {
			console.log('App Hide')
		},
		globalData: {
			appName: '贤书·置换',
			slogan: '人间烟火，书市清灵。'
		}
	}
</script>

<style lang="scss">
	/* #ifndef APP-PLUS-NVUE */
	page {
		background-color: $paper;
		color: $ink;
		font-size: 28rpx;
		font-family: $font-serif;
		line-height: 1.7;
		-webkit-font-smoothing: antialiased;
	}

	/* 通用工具类 */
	.ellipsis {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.ellipsis-2 {
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	/* 印章风格的小标题 */
	.seal-title {
		display: inline-flex;
		align-items: center;
		color: $ink;
		font-size: 32rpx;
		font-weight: 600;
		letter-spacing: 4rpx;

		&::before {
			content: '';
			width: 10rpx;
			height: 32rpx;
			background: $cinnabar;
			margin-right: 14rpx;
			border-radius: 4rpx;
		}
	}

	/* 卡片 */
	.card {
		background: $paper-light;
		border-radius: $uni-border-radius-lg;
		border: 1rpx solid $uni-border-color;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	/* #endif */
</style>
