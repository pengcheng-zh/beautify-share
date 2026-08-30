<script>
	export default {
		onLaunch: function() {
			console.log('贤书·置换 App Launch')
		},
		onShow: function() {
			console.log('贤书·置换 App Show')
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
