<template>
	<view class="page">
		<!-- 头像 -->
		<view class="card section">
			<view class="label">头像</view>
			<view class="avatar-row" @click="chooseAvatar">
				<view class="avatar" :style="{ background: avatarBg }">
					<image v-if="form.avatar" class="avatar-img" :src="form.avatar" mode="aspectFill" />
					<text v-else class="avatar-text">{{ (form.nickname || '书').slice(0, 1) }}</text>
				</view>
				<view class="avatar-side">
					<text class="avatar-tip">点击更换头像</text>
					<text v-if="form.avatar" class="avatar-clear" @click.stop="form.avatar = ''">移除头像</text>
				</view>
			</view>
		</view>

		<!-- 昵称 -->
		<view class="card section">
			<view class="label">昵称</view>
			<input class="input" v-model="form.nickname" maxlength="12" placeholder="书友称呼" placeholder-class="ph" />
		</view>

		<!-- 签名 -->
		<view class="card section">
			<view class="label">签名</view>
			<textarea class="ta" v-model="form.sign" maxlength="30" placeholder="一句话介绍自己" placeholder-class="ph" :show-confirm-bar="false" />
			<view class="count">{{ form.sign.length }}/30</view>
		</view>

		<!-- 定位 -->
		<view class="card section">
			<view class="label">定位</view>
			<view class="loc-row" @click="chooseLocation">
				<view class="pin"></view>
				<text class="loc-text">{{ form.location || '选择常驻书市位置' }}</text>
				<text class="loc-arrow">›</text>
			</view>
			<view v-if="form.location" class="loc-clear" @click="form.location = ''">清除位置</view>
		</view>

		<!-- 保存 -->
		<view class="save-row">
			<view class="save" @click="save">保 存</view>
		</view>
	</view>
</template>

<script>
	import { useUserStore } from '@/store/user.js'

	const AVATAR_COLORS = ['#07C160', '#576B95', '#E6A23C', '#5B8FF9', '#9254DE', '#FF7A45']

	export default {
		data() {
			return {
				form: { avatar: '', nickname: '', sign: '', location: '' }
			}
		},
		computed: {
			avatarBg() {
				const name = this.form.nickname || '书'
				let h = 0
				for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997
				return AVATAR_COLORS[h % AVATAR_COLORS.length]
			}
		},
		onLoad() {
			this.userStore = useUserStore()
			const u = this.userStore.user || {}
			this.form = {
				avatar: u.avatar || '',
				nickname: u.nickname || '',
				sign: u.sign || '',
				location: u.location || ''
			}
		},
		methods: {
			chooseAvatar() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						const temp = res.tempFilePaths[0]
						// 保存为本地持久文件，避免临时文件在小程序重启后失效
						uni.saveFile({
							tempFilePath: temp,
							success: (r) => {
								this.form.avatar = r.savedFilePath
							},
							fail: () => {
								this.form.avatar = temp
							}
						})
					}
				})
			},
			chooseLocation() {
				uni.chooseLocation({
					success: (res) => {
						this.form.location = res.name || res.address || '所选位置'
					},
					fail: (err) => {
						// 用户主动取消，静默处理；其他失败（如拒绝授权）给出提示
						if (err && err.errMsg && err.errMsg.indexOf('cancel') > -1) {
							return
						}
						uni.showToast({ title: '未能打开地图选点，请检查定位权限', icon: 'none' })
					}
				})
			},
			save() {
				const nickname = this.form.nickname.trim()
				if (!nickname) {
					uni.showToast({ title: '昵称不能为空', icon: 'none' })
					return
				}
				this.userStore.updateUser({
					avatar: this.form.avatar || '',
					nickname,
					sign: this.form.sign.trim(),
					location: this.form.location.trim()
				})
				uni.showToast({ title: '资料已更新', icon: 'none' })
				setTimeout(() => {
					uni.navigateBack()
				}, 600)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page {
		padding: 24rpx 24rpx 60rpx;
		min-height: 100vh;
		box-sizing: border-box;
	}

	.section {
		padding: 28rpx 30rpx;
		margin-bottom: 20rpx;
	}

	.label {
		font-size: 28rpx;
		font-weight: 600;
		color: $ink;
		letter-spacing: 2rpx;
		margin-bottom: 20rpx;
	}

	/* 头像 */
	.avatar-row {
		display: flex;
		align-items: center;
	}

	.avatar {
		width: 140rpx;
		height: 140rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		overflow: hidden;
		box-shadow: inset 0 -8rpx 16rpx rgba(0, 0, 0, 0.12);
	}

	.avatar-img {
		width: 100%;
		height: 100%;
	}

	.avatar-text {
		color: #FFFFFF;
		font-size: 60rpx;
		font-weight: 600;
	}

	.avatar-side {
		margin-left: 30rpx;
		display: flex;
		flex-direction: column;
	}

	.avatar-tip {
		font-size: 28rpx;
		color: $ink;
	}

	.avatar-clear {
		margin-top: 14rpx;
		font-size: 24rpx;
		color: $cinnabar;
	}

	/* 输入 */
	.input {
		background: #f7f3ea;
		border-radius: 12rpx;
		padding: 20rpx 24rpx;
		font-size: 30rpx;
		color: #191919;
	}

	.ta {
		width: 100%;
		height: 120rpx;
		font-size: 30rpx;
		line-height: 1.8;
		color: #191919;
		box-sizing: border-box;
	}

	.ph {
		color: #B2B2B2;
	}

	.count {
		text-align: right;
		font-size: 22rpx;
		color: $ink-soft;
	}

	/* 定位 */
	.loc-row {
		display: flex;
		align-items: center;
		background: #f7f3ea;
		border-radius: 12rpx;
		padding: 20rpx 24rpx;
	}

	.pin {
		width: 20rpx;
		height: 20rpx;
		border: 4rpx solid $stone;
		border-radius: 50% 50% 50% 0;
		transform: rotate(-45deg);
		margin-right: 16rpx;
		margin-bottom: 4rpx;
		flex-shrink: 0;
	}

	.loc-text {
		flex: 1;
		font-size: 28rpx;
		color: #191919;
	}

	.loc-arrow {
		color: $ink-soft;
		font-size: 36rpx;
	}

	.loc-clear {
		margin-top: 16rpx;
		text-align: right;
		font-size: 24rpx;
		color: $ink-soft;
	}

	/* 保存 */
	.save-row {
		margin-top: 40rpx;
	}

	.save {
		background: $cinnabar;
		color: #FFFFFF;
		font-size: 32rpx;
		letter-spacing: 8rpx;
		text-align: center;
		padding: 26rpx 0;
		border-radius: 16rpx;
		box-shadow: 0 8rpx 20rpx rgba(7, 193, 96, 0.25);
	}
</style>
