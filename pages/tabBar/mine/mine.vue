<template>
	<view class="page">
		<!-- 用户头部 -->
		<view class="profile card" @click="goEditProfile">
			<view class="avatar" :style="{ background: avatarBg }">
				<image v-if="user.avatar" class="avatar-img" :src="user.avatar" mode="aspectFill" />
				<text v-else class="avatar-text">{{ nickname.slice(0, 1) }}</text>
			</view>
			<view class="p-info">
				<view class="p-name-row">
					<text class="p-name">{{ nickname }}</text>
					<view class="p-role">{{ isAdmin ? '掌柜' : '书友' }}</view>
				</view>
				<text class="p-sign">{{ user.sign || '这个人很懒，什么都没写。' }}</text>
				<view v-if="user.location" class="p-loc">
					<view class="pin"></view>
					<text>{{ user.location }}</text>
				</view>
			</view>
			<text class="p-edit">编辑 ›</text>
		</view>

		<!-- 数据统计 -->
		<view class="stats card">
			<view class="stat" @click="goRecords">
				<text class="stat-num">{{ summary.postCount }}</text>
				<text class="stat-label">发布</text>
			</view>
			<view class="stat" @click="goLikes">
				<text class="stat-num">{{ summary.likeCount }}</text>
				<text class="stat-label">点赞</text>
			</view>
			<view class="stat" @click="goFavorites">
				<text class="stat-num">{{ summary.favoriteCount }}</text>
				<text class="stat-label">收藏</text>
			</view>
			<view class="stat" @click="goShares">
				<text class="stat-num">{{ summary.shareCount }}</text>
				<text class="stat-label">分享</text>
			</view>
		</view>

		<!-- 我的创作 -->
		<view class="group card">
			<view class="group-title">我的创作</view>
			<view class="row" @click="goRecords">
				<view class="row-icon row-icon-book">书</view>
				<text class="row-text">我的发布</text>
				<view v-if="pendingCount" class="badge">{{ pendingCount }} 待审</view>
				<text class="row-arrow">›</text>
			</view>
		</view>

		<!-- 我的足迹 -->
		<view class="group card">
			<view class="group-title">我的足迹</view>
			<view class="row" @click="goLikes">
				<view class="row-icon row-icon-like">♥</view>
				<text class="row-text">我的点赞</text>
				<text class="row-num">{{ summary.likeCount }}</text>
				<text class="row-arrow">›</text>
			</view>
			<view class="row" @click="goFavorites">
				<view class="row-icon row-icon-fav">★</view>
				<text class="row-text">我的收藏</text>
				<text class="row-num">{{ summary.favoriteCount }}</text>
				<text class="row-arrow">›</text>
			</view>
			<view class="row" @click="goShares">
				<view class="row-icon row-icon-share">↗</view>
				<text class="row-text">我的分享</text>
				<text class="row-num">{{ summary.shareCount }}</text>
				<text class="row-arrow">›</text>
			</view>
		</view>

		<!-- 掌柜台 -->
		<view v-if="isAdmin" class="group card">
			<view class="group-title">掌柜台</view>
			<view class="row" @click="goAudit">
				<view class="row-icon row-icon-admin">审</view>
				<text class="row-text">内容与评论审核</text>
				<view v-if="auditCount" class="badge">{{ auditCount }} 待审</view>
				<text class="row-arrow">›</text>
			</view>
		</view>

		<view class="foot">贤书·置换｜人间烟火，书市清灵。</view>
	</view>
</template>

<script>
	import { useContentStore } from '@/store/content.js'
	import { useUserStore } from '@/store/user.js'
	import { postApi } from '@/common/api.js'
	import { greeting } from '@/common/format.js'

	export default {
		data() {
			return {
				greet: '',
				// /post/mine-summary 拿到的计数，默认 0
				summary: {
					postCount: 0,
					likeCount: 0,
					favoriteCount: 0,
					shareCount: 0
				}
			}
		},
		computed: {
			// store 做成 computed：useUserStore()/useContentStore() 返回同一个单例，
			// 任何时刻都不为空，且后续依赖能正常收集、自动响应更新
			userStore() {
				return useUserStore()
			},
			contentStore() {
				return useContentStore()
			},
			user() {
				return this.userStore.user || {}
			},
			nickname() {
				return this.user.username || this.user.nickname || '书友'
			},
			avatarBg() {
				const colors = ['#07C160', '#576B95', '#E6A23C', '#5B8FF9']
				let h = 0
				const id = String(this.user.userId || this.user.id || 'u1')
				for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997
				return colors[h % colors.length]
			},
			isAdmin() {
				return this.user.roleId == 1
			},
			// 「待审发布」仍走 contentStore（管理端待审总数需要全量列表）
			myContents() {
				return this.contentStore.myContents()
			},
			pendingCount() {
				return this.myContents.filter((c) => c.status === 'pending').length
			},
			auditCount() {
				return this.contentStore.pendingContents.length + this.contentStore.pendingComments.length
			}
			},
			async onLoad() {
				// 重新请求 /auth/me，获取最新用户信息（头像/昵称/签名/性别等）
				this.userStore.refreshMe()
				// 拉取我的数据汇总（不再拉 post/mine 全量列表）
				this.loadSummary()
			},
			onShow() {
				this.loadSummary()
				this.greet = greeting()
			},
		methods: {
			async loadSummary() {
				try {
					const data = await postApi.mineSummary()
					if (data && typeof data === 'object') {
						this.summary = {
							postCount: Number(data.postCount) || 0,
							likeCount: Number(data.likeCount) || 0,
							favoriteCount: Number(data.favoriteCount) || 0,
							shareCount: Number(data.shareCount) || 0
						}
					}
				} catch (e) {
					console.warn('[mine] loadSummary failed', e)
				}
			},
			goEditProfile() {
				uni.navigateTo({ url: '/pages/mine/profile-edit' })
			},
			goRecords(tab = -1) {
				uni.navigateTo({
					url: '/pages/mine/records' + (tab >= 0 ? '?tab=' + tab : '')
				})
			},
			goLikes() {
				uni.navigateTo({ url: '/pages/mine/likes' })
			},
			goFavorites() {
				uni.navigateTo({ url: '/pages/mine/favorites' })
			},
			goShares() {
				uni.navigateTo({ url: '/pages/mine/shares' })
			},
			goAudit() {
				uni.navigateTo({ url: '/pages/admin/audit' })
			}
		}
	}
</script>

<style lang="scss" scoped>
	.page {
		padding: 24rpx 24rpx 40rpx;
		min-height: 100vh;
		box-sizing: border-box;
	}

	/* 头部 */
	.profile {
		padding: 40rpx 34rpx;
		display: flex;
		align-items: center;
	}

	.avatar {
		width: 130rpx;
		height: 130rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		overflow: hidden;
		box-shadow: inset 0 -8rpx 16rpx rgba(0, 0, 0, 0.12);
	}

	.avatar-text {
		color: #FFFFFF;
		font-size: 56rpx;
		font-weight: 600;
	}

	.avatar-img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}

	.p-info {
		margin-left: 30rpx;
		flex: 1;
		min-width: 0;
	}

	.p-name-row {
		display: flex;
		align-items: center;
	}

	.p-name {
		font-size: 40rpx;
		font-weight: 700;
		color: $ink;
	}

	.p-role {
		margin-left: 16rpx;
		font-size: 22rpx;
		color: #FFFFFF;
		background: $stone;
		padding: 4rpx 16rpx;
		border-radius: 8rpx;
	}

	.p-sign {
		display: block;
		margin-top: 12rpx;
		font-size: 26rpx;
		color: $ink-soft;
		line-height: 1.6;
	}

	.p-loc {
		margin-top: 10rpx;
		display: flex;
		align-items: center;
		font-size: 24rpx;
		color: $stone;
	}

	.pin {
		width: 16rpx;
		height: 16rpx;
		border: 3rpx solid $stone;
		border-radius: 50% 50% 50% 0;
		transform: rotate(-45deg);
		margin-right: 12rpx;
		margin-bottom: 2rpx;
	}

	.p-edit {
		margin-left: 16rpx;
		font-size: 22rpx;
		color: $ink-soft;
		flex-shrink: 0;
	}

	/* 统计 */
	.stats {
		margin-top: 20rpx;
		padding: 26rpx 0;
		display: flex;
	}

	.stat {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		border-right: 1rpx solid $uni-border-color;
	}

	.stat:last-child {
		border-right: none;
	}

	.stat-num {
		font-size: 40rpx;
		font-weight: 700;
		color: $cinnabar;
	}

	.stat-label {
		margin-top: 6rpx;
		font-size: 24rpx;
		color: $ink-soft;
	}

	/* 分组 */
	.group {
		margin-top: 20rpx;
		padding: 10rpx 30rpx;
	}

	.group-title {
		padding: 18rpx 0 10rpx;
		font-size: 26rpx;
		color: $ink-soft;
		letter-spacing: 4rpx;
	}

	.row {
		display: flex;
		align-items: center;
		padding: 26rpx 0;
		border-bottom: 1rpx solid $uni-border-color;
	}

	.group .row:last-child {
		border-bottom: none;
	}

	.row-icon {
		width: 60rpx;
		height: 60rpx;
		border-radius: 14rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
		color: #FFFFFF;
		margin-right: 24rpx;
		flex-shrink: 0;
	}

	.row-icon-book { background: $stone; }
	.row-icon-like { background: $cinnabar; }
	.row-icon-fav { background: #E6A23C; }
	.row-icon-share { background: #5B8FF9; }
	.row-icon-admin { background: #9254DE; }

	.row-text {
		flex: 1;
		font-size: 30rpx;
		color: $ink;
	}

	.row-num {
		font-size: 26rpx;
		color: $ink-soft;
		margin-right: 10rpx;
	}

	.badge {
		font-size: 22rpx;
		color: #fff;
		background: $cinnabar;
		padding: 4rpx 16rpx;
		border-radius: 999rpx;
		margin-right: 10rpx;
	}

	.row-arrow {
		color: $ink-soft;
		font-size: 40rpx;
	}

	.foot {
		margin-top: 50rpx;
		text-align: center;
		font-size: 24rpx;
		color: rgba(122, 112, 98, 0.7);
		letter-spacing: 2rpx;
	}
</style>
