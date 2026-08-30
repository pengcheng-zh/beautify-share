import { defineStore } from 'pinia'
import { useUserStore } from './user'

const K_CONTENTS = 'xs_contents'
const K_COMMENTS = 'xs_comments'
const K_MOCK_INITED = 'xs_mock_inited'

function dayAgo(days, hour = 10, minute = 30) {
	const d = new Date()
	d.setDate(d.getDate() - days)
	d.setHours(hour, minute, 0, 0)
	return d.getTime()
}

const MOCK_USERS = {
	u1: { nickname: '若谷', sign: '一箪食，一瓢饮，在陋巷，不改其乐。', role: 'admin', location: '杭州 · 运河书市' },
	u2: { nickname: '拾遗', sign: '旧书有灵，往来皆是缘。', role: 'member', location: '苏州 · 平江路旧书摊' },
	u3: { nickname: '观澜', sign: '灯下摊开一本书，世界便静了。', role: 'member', location: '苏州 · 平江路旧书摊' },
	u4: { nickname: '清欢', sign: '满架古书，一室茶香。', role: 'member', location: '北京 · 琉璃厂' },
	u5: { nickname: '小满', sign: '给旧书找一位新主人。', role: 'member', location: '南京 · 朝天宫旧书市' },
	u6: { nickname: '沉鱼', sign: '浣花溪畔，以书会友。', role: 'member', location: '成都 · 浣花溪旧书市' }
}

const MOCK_CONTENTS = [
	{
		id: 'c1',
		userId: 'u2',
		text: '周末运河书市淘到三本线装旧书，老板娘说是一位老先生搬离杭州时留下的。翻开扉页，有蝇头小楷题着赠言——书里有人的气息，这就是旧书的迷人之处。',
		images: ['/static/mock/market-1.jpg', '/static/mock/books-1.jpg'],
		voice: { path: '', duration: 8 },
		location: { name: '杭州 · 运河书市', address: '拱墅区运河广场' },
		createTime: dayAgo(0, 9, 12),
		status: 'approved',
		likes: ['u1', 'u3', 'u5'],
		favs: ['u1'],
		shares: []
	},
	{
		id: 'c2',
		userId: 'u3',
		text: '置换：《人间词话》人民文学出版社 83 年版，品相八五成新，换一本《浮生六记》旧版即可。有缘者来平江路旧书摊寻我，茶已泡好。',
		images: ['/static/mock/books-2.jpg'],
		voice: { path: '', duration: 5 },
		location: { name: '苏州 · 平江路旧书摊', address: '平江路中段' },
		createTime: dayAgo(1, 15, 40),
		status: 'approved',
		likes: ['u1', 'u2', 'u4', 'u6'],
		favs: ['u6'],
		shares: ['u1']
	},
	{
		id: 'c3',
		userId: 'u4',
		text: '雨夜无事，翻出前年在琉璃厂收的《夜航船》。张岱说：天下学问，惟夜航船中最难对付。今夜窗外雨声，倒也像极了一艘夜航船。',
		images: [],
		voice: { path: '', duration: 12 },
		location: { name: '北京 · 琉璃厂', address: '西城区琉璃厂东街' },
		createTime: dayAgo(2, 22, 5),
		status: 'approved',
		likes: ['u1', 'u3'],
		favs: [],
		shares: []
	},
	{
		id: 'c4',
		userId: 'u5',
		text: '今日在朝天宫旧书市，给女儿找到全套《城南旧事》插图本，扉页还有原主人的铅笔签名。有些书，等一个人，等了许多年。',
		images: ['/static/mock/market-2.jpg', '/static/mock/books-3.jpg', '/static/mock/market-3.jpg'],
		voice: { path: '', duration: 0 },
		location: { name: '南京 · 朝天宫旧书市', address: '秦淮区朝天宫街道' },
		createTime: dayAgo(3, 11, 20),
		status: 'approved',
		likes: ['u1', 'u2', 'u6'],
		favs: ['u2'],
		shares: []
	},
	{
		id: 'c5',
		userId: 'u6',
		text: '收书。家父整理书房，腾出两箱八十年代的旧杂志与诗集，不舍得当废纸卖，想为它们找个好去处。浣花溪书市，周末摆摊，欢迎来看。',
		images: ['/static/mock/books-4.jpg'],
		voice: { path: '', duration: 7 },
		location: { name: '成都 · 浣花溪旧书市', address: '青羊区浣花溪公园旁' },
		createTime: dayAgo(4, 16, 45),
		status: 'approved',
		likes: ['u1', 'u4'],
		favs: ['u1', 'u3'],
		shares: []
	},
	{
		id: 'c6',
		userId: 'u1',
		text: '人间烟火，书市清灵。今日新到一摞连环画与地方志，摊位在运河边第三棵柳树下。也欢迎带自己的旧书来置换，以书会友，不亦乐乎。',
		images: ['/static/mock/market-1.jpg', '/static/mock/market-3.jpg'],
		voice: { path: '', duration: 9 },
		location: { name: '杭州 · 运河书市', address: '拱墅区运河广场' },
		createTime: dayAgo(5, 8, 30),
		status: 'approved',
		likes: ['u2', 'u3', 'u5', 'u6'],
		favs: ['u4'],
		shares: ['u3']
	},
	{
		id: 'c7',
		userId: 'u2',
		text: '（演示待审核内容）有人卖一本签名版《围城》，品相不错，就是价格虚高。这年头，收书的人越来越少，卖书的人越来越多。',
		images: [],
		voice: { path: '', duration: 0 },
		location: { name: '杭州 · 运河书市', address: '拱墅区运河广场' },
		createTime: dayAgo(1, 20, 15),
		status: 'pending',
		likes: [],
		favs: [],
		shares: []
	}
]

const MOCK_COMMENTS = [
	{ id: 'm1', contentId: 'c1', userId: 'u3', text: '蝇头小楷的赠言，最见旧书的风骨。', createTime: dayAgo(0, 10, 2), status: 'approved' },
	{ id: 'm2', contentId: 'c1', userId: 'u5', text: '运河书市好久没去了，周末约起！', createTime: dayAgo(0, 11, 20), status: 'approved' },
	{ id: 'm3', contentId: 'c2', userId: 'u2', text: '我有《浮生六记》旧版，明日带过去。', createTime: dayAgo(1, 16, 10), status: 'approved' },
	{ id: 'm4', contentId: 'c2', userId: 'u6', text: '（演示待审核评论）广告位招租，书摊前排请联系我。', createTime: dayAgo(1, 18, 30), status: 'pending' },
	{ id: 'm5', contentId: 'c6', userId: 'u4', text: '以书会友，深以为然。改日南下拜访。', createTime: dayAgo(5, 9, 12), status: 'approved' }
]

function clone(obj) {
	return JSON.parse(JSON.stringify(obj))
}

export const useContentStore = defineStore('content', {
	state: () => ({
		contents: [],
		comments: [],
		users: clone(MOCK_USERS)
	}),
	getters: {
		approvedContents: (state) =>
			state.contents
				.filter((c) => c.status === 'approved')
				.sort((a, b) => b.createTime - a.createTime),
		pendingContents: (state) => state.contents.filter((c) => c.status === 'pending'),
		approvedComments: (state) => state.comments.filter((c) => c.status === 'approved'),
		pendingComments: (state) => state.comments.filter((c) => c.status === 'pending')
	},
	actions: {
		init() {
			let inited = false
			try {
				inited = !!uni.getStorageSync(K_MOCK_INITED)
			} catch (e) {}
			try {
				this.contents = uni.getStorageSync(K_CONTENTS) || []
			} catch (e) {
				this.contents = []
			}
			try {
				this.comments = uni.getStorageSync(K_COMMENTS) || []
			} catch (e) {
				this.comments = []
			}
			if (!inited && this.contents.length === 0) {
				this.contents = clone(MOCK_CONTENTS)
				this.comments = clone(MOCK_COMMENTS)
				this.persist()
				try {
					uni.setStorageSync(K_MOCK_INITED, true)
				} catch (e) {}
			}
		},
		persist() {
			try {
				uni.setStorageSync(K_CONTENTS, this.contents)
				uni.setStorageSync(K_COMMENTS, this.comments)
			} catch (e) {}
		},
		getContent(id) {
			return this.contents.find((c) => c.id === id) || null
		},
		getUser(id) {
			// 当前登录用户优先取实时资料（含头像），保证编辑后全局同步
			const userStore = useUserStore()
			if (userStore.user && userStore.user.id === id) {
				return { ...userStore.user }
			}
			const u = this.users[id]
			return u ? { id, ...u } : { id, nickname: '无名书友', sign: '', location: '' }
		},
		getCommentsOf(contentId) {
			return this.comments
				.filter((c) => c.contentId === contentId)
				.sort((a, b) => a.createTime - b.createTime)
		},
		/* 发布：默认进入待审核 */
		publish({ text = '', images = [], voice = null, location = null }) {
			const userStore = useUserStore()
			const content = {
				id: 'c' + Date.now(),
				userId: userStore.user ? userStore.user.id : 'u1',
				text,
				images: images || [],
				voice: voice || { path: '', duration: 0 },
				location: location || null,
				createTime: Date.now(),
				status: 'pending',
				likes: [],
				favs: [],
				shares: []
			}
			this.contents.unshift(content)
			this.persist()
			return content
		},
		toggleLike(contentId) {
			const c = this.getContent(contentId)
			if (!c) return
			const uid = this.me().id
			const idx = c.likes.indexOf(uid)
			if (idx > -1) c.likes.splice(idx, 1)
			else c.likes.push(uid)
			this.persist()
		},
		toggleFav(contentId) {
			const c = this.getContent(contentId)
			if (!c) return
			const uid = this.me().id
			const idx = c.favs.indexOf(uid)
			if (idx > -1) c.favs.splice(idx, 1)
			else c.favs.push(uid)
			this.persist()
		},
		recordShare(contentId) {
			const c = this.getContent(contentId)
			if (!c) return
			const uid = this.me().id
			if (c.shares.indexOf(uid) === -1) c.shares.push(uid)
			this.persist()
		},
		addComment(contentId, text) {
			const cm = {
				id: 'm' + Date.now(),
				contentId,
				userId: this.me().id,
				text,
				createTime: Date.now(),
				status: 'pending'
			}
			this.comments.push(cm)
			this.persist()
			return cm
		},
		auditContent(contentId, status) {
			const c = this.getContent(contentId)
			if (!c) return
			c.status = status
			this.persist()
		},
		auditComment(commentId, status) {
			const cm = this.comments.find((x) => x.id === commentId)
			if (!cm) return
			cm.status = status
			this.persist()
		},
		/* 我的数据 */
		myContents() {
			const uid = this.me().id
			return this.contents
				.filter((c) => c.userId === uid)
				.sort((a, b) => b.createTime - a.createTime)
		},
		myLiked() {
			const uid = this.me().id
			return this.contents.filter((c) => c.likes.indexOf(uid) > -1)
		},
		myFavorited() {
			const uid = this.me().id
			return this.contents.filter((c) => c.favs.indexOf(uid) > -1)
		},
		myShared() {
			const uid = this.me().id
			return this.contents.filter((c) => c.shares.indexOf(uid) > -1)
		},
		me() {
			const userStore = useUserStore()
			if (userStore.user) return userStore.user
			userStore.login()
			return userStore.user
		}
	}
})
