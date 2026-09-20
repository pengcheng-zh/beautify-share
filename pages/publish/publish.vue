<template>
	<view class="page">
		<!-- 正文 -->
		<view class="card section">
			<view class="label">书帖正文</view>
			<textarea
				v-model="text"
				class="ta"
				placeholder="写下一段文字，关于书、关于市集、关于置换……"
				placeholder-class="ta-ph"
				maxlength="500"
				:show-confirm-bar="false"
			/>
			<view class="count">{{ text.length }}/500</view>
		</view>

		<!-- 配图 -->
		<view class="card section">
			<view class="label">配图 <text class="label-sub">最多 9 张</text></view>
			<view class="imgs">
				<view v-for="(img, i) in images" :key="i" class="img-wrap">
					<image class="img" :src="img" mode="aspectFill" @click="preview(i)" />
					<view class="img-del" @click="removeImage(i)">×</view>
				</view>
				<view v-if="images.length < 9" class="img-add" @click="chooseImage">
					<text class="add-plus">＋</text>
					<text class="add-text">配图</text>
				</view>
			</view>
		</view>

		<!-- 语音 -->
		<view class="card section">
			<view class="label">语音留言</view>
			<view
				class="record"
				:class="{ recording: recording }"
				@touchstart="startRecord"
				@touchend="stopRecord"
				@touchcancel="stopRecord"
			>
				<view class="record-icon">
					<view class="r-bar" :class="{ on: recording }"></view>
					<view class="r-bar" :class="{ on: recording }"></view>
					<view class="r-bar" :class="{ on: recording }"></view>
				</view>
				<text class="record-text">
					{{ recording ? '松开结束 · ' + recordSeconds + '″' : (voice.duration ? '已录制 ' + voice.duration + '″（点击下方可重录）' : '按住说话，松手完成') }}
				</text>
			</view>
			<view v-if="voice.duration" class="voice-done">
				<view class="voice-play" @click="playVoice">▶ 试听</view>
				<view class="voice-clear" @click="voice = { path: '', duration: 0 }">删除</view>
			</view>
		</view>

		<!-- 位置 -->
		<view class="card section">
			<view class="label">位置</view>
			<view class="loc-row" @click="chooseLocation">
				<view class="pin"></view>
				<text class="loc-text">{{ location ? location.name : '添加所在书市位置' }}</text>
				<text class="loc-arrow">›</text>
			</view>
		</view>

		<!-- 提交 -->
		<view class="submit-row">
			<view class="submit" @click="submit">呈 上</view>
			<text class="submit-tip">提交后将进入审核，通过后即在书斋示人</text>
		</view>
	</view>
</template>

<script>
	import { useContentStore } from '@/store/content.js'
	import { uploadApi, postApi } from '@/common/api.js'

	export default {
		data() {
			return {
				text: '',
				images: [],
				voice: { path: '', duration: 0 },
				location: null,
				submitting: false,
				recording: false,
				recordSeconds: 0,
				recordTimer: null,
				recorder: null,
				innerAudio: null
			}
		},
		onLoad() {
			this.initRecorder()
			// store 初始化独立保护，任何异常都不影响录音等能力
			try {
				this.contentStore = useContentStore()
				this.contentStore.init()
			} catch (e) {
				console.error('contentStore init failed', e)
			}
		},
		onUnload() {
			clearInterval(this.recordTimer)
			if (this.recorder && this.recording) {
				this.recorder.stop()
			}
			if (this.innerAudio) {
				this.innerAudio.destroy()
			}
		},
		methods: {
			initRecorder() {
				// 幂等：RecorderManager 是全局单例，重复调用会叠加事件回调，必须已存在则跳过
				if (this.recorder) return
				this.recorder = uni.getRecorderManager()
				this.recorder.onStart(() => {
					// 录音真正开始后才进入录音态并计时，避免授权异步导致状态错乱
					this.recording = true
					this.recordSeconds = 0
					this.recordTimer = setInterval(() => {
						this.recordSeconds++
						if (this.recordSeconds >= 60) this.stopRecord()
					}, 1000)
				})
				this.recorder.onStop((res) => {
					this.recording = false
					clearInterval(this.recordTimer)
					if (!res || !res.tempFilePath) {
						uni.showToast({ title: '录音失败，请重试', icon: 'none' })
						return
					}
					const duration = Math.max(1, Math.round(this.recordSeconds))
					this.voice = { path: res.tempFilePath, duration: duration > 60 ? 60 : duration }
				})
				this.recorder.onError((err) => {
					this.recording = false
					clearInterval(this.recordTimer)
					if (err && err.errMsg && err.errMsg.indexOf('auth') > -1) {
						uni.showModal({
							title: '需要麦克风权限',
							content: '录音功能需要麦克风权限，请在设置中开启',
							confirmText: '去设置',
							success: (r) => {
								if (r.confirm) uni.openSetting()
							}
						})
					} else {
						uni.showToast({ title: '录音失败，请重试', icon: 'none' })
					}
				})
			},
			chooseImage() {
				const rest = 9 - this.images.length
				if (rest <= 0) return
				uni.chooseImage({
					count: rest,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.images = this.images.concat(res.tempFilePaths).slice(0, 9)
					}
				})
			},
			preview(index) {
				uni.previewImage({
					current: index,
					urls: this.images
				})
			},
			removeImage(i) {
				this.images.splice(i, 1)
			},
			startRecord() {
				if (this.recording) return
				this.initRecorder()
				uni.getSetting({
					success: (res) => {
						const auth = res.authSetting['scope.record']
						if (auth === true) {
							// 已授权，直接开始录音
							this.recorder.start({ duration: 60000, format: 'aac' })
						} else if (auth === undefined) {
							// 首次使用：只请求授权，不自动开始录音，
							// 避免授权弹窗与按动手势异步冲突导致录音悬空
							uni.authorize({
								scope: 'scope.record',
								success: () => {
									uni.showToast({ title: '麦克风已开启，请再次按住录音', icon: 'none' })
								},
								fail: () => {
									uni.showToast({ title: '已拒绝录音权限', icon: 'none' })
								}
							})
						} else {
							// 曾拒绝授权，引导去设置页开启
							uni.showModal({
								title: '需要麦克风权限',
								content: '录音功能需要麦克风权限，请在设置中开启',
								confirmText: '去设置',
								success: (r) => {
									if (r.confirm) uni.openSetting()
								}
							})
						}
					},
					fail: () => {
						// 权限查询失败时直接尝试录音
						this.recorder.start({ duration: 60000, format: 'aac' })
					}
				})
			},
			stopRecord() {
				if (!this.recording || !this.recorder) return
				this.recorder.stop()
			},
			playVoice() {
				if (!this.voice.path) return
				if (!this.innerAudio) {
					this.innerAudio = uni.createInnerAudioContext()
				}
				this.innerAudio.src = this.voice.path
				this.innerAudio.play()
			},
			chooseLocation() {
				uni.chooseLocation({
					success: (res) => {
						this.location = {
							name: res.name || '所选位置',
							address: res.address || '',
							lat: res.latitude,
							lng: res.longitude
						}
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
			submit() {
				if (!this.text.trim() && !this.images.length && !this.voice.duration) {
					uni.showToast({ title: '写点什么吧', icon: 'none' })
					return
				}
				if (this.submitting) return
				this.submitting = true
				this.doSubmit()
			},
			async doSubmit() {
				uni.showLoading({ title: '呈递中', mask: true })
				try {
					// 1. 上传图片，收集后端 URL
					const pictures = []
					for (const img of this.images) {
						const url = await uploadApi.uploadFile(img)
						pictures.push(url)
					}
					// 2. 上传语音（最多一条：地址与时长成对携带）

					console.log('this.voice', this.voice)
					let voiceUrl = ''
					let voiceDuration = 0
					if (this.voice.path && this.voice.duration) {
						voiceUrl = await uploadApi.uploadFile(this.voice.path)
						voiceDuration = this.voice.duration
					}
					// 3. 创建书帖
					const payload = {
						content: this.text.trim(),
						pictures,
						location: this.location ? (this.location.name || '') : '',
						latitude: this.location ? String(this.location.lat || '') : '',
						longitude: this.location ? String(this.location.lng || '') : '',
						voice: voiceUrl,
						duration: voiceDuration
					}
					await postApi.create(payload)
					uni.hideLoading()
					uni.showToast({ title: '已呈上，待掌柜审核', icon: 'none' })
					setTimeout(() => {
						uni.navigateBack()
					}, 1200)
				} catch (e) {
					this.submitting = false
					uni.hideLoading()
					uni.showToast({
						title: (e && e.message) || '呈递失败，请重试',
						icon: 'none'
					})
				}
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

	.label-sub {
		font-size: 22rpx;
		color: $ink-soft;
		font-weight: 400;
		margin-left: 12rpx;
	}

	.ta {
		width: 100%;
		height: 240rpx;
		font-size: 30rpx;
		line-height: 1.8;
		color: #191919;
		box-sizing: border-box;
	}

	.ta-ph {
		color: #B2B2B2;
	}

	.count {
		text-align: right;
		font-size: 22rpx;
		color: $ink-soft;
	}

	/* 图片 */
	.imgs {
		display: flex;
		flex-wrap: wrap;
	}

	.img-wrap {
		position: relative;
		width: 200rpx;
		height: 200rpx;
		margin: 0 16rpx 16rpx 0;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.img {
		width: 100%;
		height: 100%;
	}

	.img-del {
		position: absolute;
		top: 0;
		right: 0;
		width: 44rpx;
		height: 44rpx;
		background: rgba(0, 0, 0, 0.5);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		border-radius: 0 0 0 12rpx;
	}

	.img-add {
		width: 200rpx;
		height: 200rpx;
		border: 2rpx dashed $uni-border-color;
		border-radius: 12rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: $paper-deep;
	}

	.add-plus {
		font-size: 60rpx;
		color: $ink-soft;
		line-height: 1;
	}

	.add-text {
		margin-top: 10rpx;
		font-size: 24rpx;
		color: $ink-soft;
	}

	/* 录音 */
	.record {
		display: flex;
		align-items: center;
		padding: 26rpx 30rpx;
		background: $paper-deep;
		border-radius: 14rpx;
		border: 2rpx solid $uni-border-color;
	}

	.record.recording {
		border-color: $cinnabar;
		background: rgba(7, 193, 96, 0.06);
	}

	.record-icon {
		display: flex;
		align-items: flex-end;
		height: 40rpx;
		margin-right: 20rpx;
	}

	.r-bar {
		width: 8rpx;
		margin-right: 6rpx;
		background: $ink-soft;
		border-radius: 4rpx;
		height: 18rpx;
	}

	.r-bar:nth-child(1) { height: 18rpx; }
	.r-bar:nth-child(2) { height: 36rpx; }
	.r-bar:nth-child(3) { height: 26rpx; }

	.r-bar.on {
		background: $cinnabar;
		animation: rwave 0.7s ease-in-out infinite;
	}

	.r-bar.on:nth-child(2) { animation-delay: 0.12s; }
	.r-bar.on:nth-child(3) { animation-delay: 0.24s; }

	@keyframes rwave {
		0%, 100% { transform: scaleY(0.5); }
		50% { transform: scaleY(1.3); }
	}

	.record-text {
		font-size: 26rpx;
		color: $ink;
	}

	.voice-done {
		display: flex;
		margin-top: 18rpx;
	}

	.voice-play,
	.voice-clear {
		font-size: 26rpx;
		padding: 10rpx 26rpx;
		border-radius: 999rpx;
		margin-right: 16rpx;
	}

	.voice-play {
		background: $stone;
		color: #FFFFFF;
	}

	.voice-clear {
		background: $paper-deep;
		color: $ink-soft;
	}

	/* 位置 */
	.loc-row {
		display: flex;
		align-items: center;
		padding: 20rpx 24rpx;
		background: $paper-deep;
		border-radius: 12rpx;
	}

	.pin {
		width: 20rpx;
		height: 20rpx;
		border: 4rpx solid $stone;
		border-radius: 50% 50% 50% 0;
		transform: rotate(-45deg);
		margin-right: 16rpx;
		flex-shrink: 0;
	}

	.loc-text {
		flex: 1;
		font-size: 28rpx;
		color: $ink;
	}

	.loc-arrow {
		color: $ink-soft;
		font-size: 40rpx;
	}

	/* 提交 */
	.submit-row {
		margin-top: 50rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.submit {
		width: 320rpx;
		height: 92rpx;
		background: linear-gradient(145deg, $cinnabar-light, $cinnabar);
		color: #FFFFFF;
		font-size: 36rpx;
		font-weight: 600;
		letter-spacing: 16rpx;
		text-indent: 16rpx;
		border-radius: 999rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 10rpx 24rpx rgba(7, 193, 96, 0.35);
	}

	.submit:active {
		transform: scale(0.97);
	}

	.submit-tip {
		margin-top: 20rpx;
		font-size: 24rpx;
		color: $ink-soft;
	}
</style>
