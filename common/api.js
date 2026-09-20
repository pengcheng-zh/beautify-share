/**
 * 后端接口基础封装
 * 适配 uni-app 的 uni.request，覆盖微信小程序、H5、App-Plus 等平台
 */

// 后端服务地址（部署时改为正式域名）
// export const BASE_URL = 'https://api.xianshu.example.com'
export const BASE_URL = 'http://localhost:8080'

const TOKEN_KEY = 'xs_token'

/** 读取本地保存的鉴权 token */
export function getToken() {
	try {
		return uni.getStorageSync(TOKEN_KEY) || ''
	} catch (e) {
		return ''
	}
}

/** 保存鉴权 token（与用户信息分开存储） */
export function setToken(token) {
	try {
		if (token) {
			uni.setStorageSync(TOKEN_KEY, token)
		} else {
			uni.removeStorageSync(TOKEN_KEY)
		}
	} catch (e) {}
}

/** 清除鉴权 token */
export function clearToken() {
	setToken('')
}

/**
 * 统一请求方法
 * @param {Object} opts
 * @param {string} opts.url        接口路径（不带 baseUrl）
 * @param {string} [opts.method]   GET/POST 等，默认 GET
 * @param {Object} [opts.data]     请求参数
 * @param {Object} [opts.header]   自定义请求头
 * @param {number} [opts.timeout]  超时时间，默认 8000ms
 * @returns {Promise<any>}         业务层 data 字段
 */
export function request({
	url,
	method = 'GET',
	data = {},
	header = {},
	timeout = 8000
}) {
	return new Promise((resolve, reject) => {
		// 所有请求自动携带鉴权 token（登录接口本身无 token 时自然跳过）
		const token = getToken()
		const authHeader = token ? { Authorization: token } : {}
		uni.request({
			url: BASE_URL + url,
			method,
			data,
			header: Object.assign({ 'Content-Type': 'application/json' }, authHeader, header),
			timeout,
			success: (res) => {
				const status = res.statusCode
				const body = res.data || {}
				if (status >= 200 && status < 300) {
					// 后端约定：{ messageId, message, result, object }
					// result === true 表示成功，object 为业务数据
					if (body && typeof body === 'object' && 'result' in body) {
						if (body.result === true || body.result === 'true') {
							resolve(body.object === undefined ? body : body.object)
						} else {
							reject({
								code: body.messageId || status,
								message: body.message || '请求失败',
								raw: body
							})
						}
					} else {
						// 没有统一包装时，直接返回原始数据
						resolve(body)
					}
				} else {
					reject({ code: status, message: '网络异常', raw: body })
				}
			},
			fail: (err) => {
				reject({ code: -1, message: (err && err.errMsg) || '网络异常', raw: err })
			}
		})
	})
}

/**
 * 鉴权相关接口
 */
export const authApi = {
	/**
	 * 静默登录：客户端仅提供微信 code（若有），
	 * 后端据此识别用户并返回完整用户资料（含 gender 等）。
	 * @param {Object} payload
	 * @param {string} [payload.code]  uni.login() 返回的 code
	 */
	silentLogin: (payload = {}) => request({
		url: '/auth/login',
		method: 'POST',
		data: payload
	}),

	/**
	 * 更新用户性别
	 * @param {number} gender 后端 Integer：1 = 男，2 = 女
	 */
	updateGender: (gender) => request({
		url: '/auth/update-gender',
		method: 'POST',
		data: { gender }
	}),

	/**
	 * 获取当前登录用户信息（需携带 token）
	 * @returns {Promise<Object>} 最新的用户资料
	 */
	me: () => request({
		url: '/auth/me',
		method: 'GET'
	})
}

/**
 * 上传相关接口
 */
export const uploadApi = {
	/**
	 * 上传单个文件（图片 / 语音等）
	 * @param {string} filePath 本地临时文件路径（tempFilePath）
	 * @returns {Promise<string>} 后端返回的文件访问 URL
	 */
	uploadFile: (filePath) => new Promise((resolve, reject) => {
		uni.uploadFile({
			url: BASE_URL + '/upload/file',
			filePath,
			name: 'file',
			header: {
				Authorization: getToken()
			},
			success: (res) => {
				const status = res.statusCode
				let body = {}
				try {
					body = typeof res.data === 'string' ? JSON.parse(res.data) : (res.data || {})
				} catch (e) {
					body = {}
				}
				if (status >= 200 && status < 300) {
					// 后端约定：{ messageId, message, result, object: { url } }
					if (body && typeof body === 'object' && 'result' in body) {
						if (body.result === true || body.result === 'true') {
							// object 形如 { url: xxx }，取出 url；兼容直接返回字符串/缺失的情况
							const obj = body.object
							if (obj && typeof obj === 'object' && obj.url !== undefined) {
								resolve(obj.url)
							} else if (typeof obj === 'string') {
								resolve(obj)
							} else {
								reject({ code: body.messageId || status, message: '上传成功但未返回文件地址', raw: body })
							}
						} else {
							reject({ code: body.messageId || status, message: body.message || '上传失败', raw: body })
						}
					} else {
						resolve(body)
					}
				} else {
					reject({ code: status, message: '上传失败', raw: body })
				}
			},
			fail: (err) => {
				reject({ code: -1, message: (err && err.errMsg) || '上传失败', raw: err })
			}
		})
	})
}

/**
 * 书帖（post）相关接口
 */
export const postApi = {
	/** 首页信息流，分页 */
	feed: ({ page = 1, pageSize = 10 } = {}) => request({
		url: `/post/feed?page=${page}&pageSize=${pageSize}`,
		method: 'GET'
	}),

	/** 书帖详情 */
	detail: (id) => request({
		url: `/post/detail/${id}`,
		method: 'GET'
	}),

	/** 点赞（toggle，由后端决定当前状态） */
	like: (id) => request({
		url: `/post-like/${id}`,
		method: 'POST'
	}),

	/** 收藏（toggle） */
	favorite: (id) => request({
		url: `/post-favorite/${id}`,
		method: 'POST'
	}),

	/**
	 * 我点赞过的书帖列表，分页
	 * @param {Object} params
	 * @param {number} [params.page=1]
	 * @param {number} [params.pageSize=20]
	 */
	likeList: ({ page = 1, pageSize = 20 } = {}) => request({
		url: `/post/like-list?page=${page}&pageSize=${pageSize}`,
		method: 'GET'
	}),

	/**
	 * 我收藏的书帖列表，分页
	 * @param {Object} params
	 * @param {number} [params.page=1]
	 * @param {number} [params.pageSize=20]
	 */
	favoriteList: ({ page = 1, pageSize = 20 } = {}) => request({
		url: `/post/favorite-list?page=${page}&pageSize=${pageSize}`,
		method: 'GET'
	}),

	/**
	 * 我的发布，分页
	 * @param {Object} params
	 * @param {number} [params.page=1]
	 * @param {number} [params.pageSize=10]
	 * @param {string} [params.status] 审核状态：A=待审核, B/P=已通过, C/R=未通过。不传 = 全部
	 */
	mine: ({ page = 1, pageSize = 10, status } = {}) => {
		const qs = `page=${page}&pageSize=${pageSize}` + (status ? `&status=${encodeURIComponent(status)}` : '')
		return request({
			url: `/post/mine?${qs}`,
			method: 'GET'
		})
	},

	/**
	 * 我的数据汇总（发布/点赞/收藏/分享 计数）
	 * 后端字段：postCount, likeCount, favoriteCount, shareCount
	 */
	mineSummary: () => request({
		url: '/post/mine-summary',
		method: 'GET'
	}),

	/**
	 * 创建书帖
	 * @param {Object} payload
	 * @param {string} payload.content    正文
	 * @param {string[]} payload.pictures 图片 URL 列表
	 * @param {string} [payload.location] 位置名称
	 * @param {string} [payload.latitude] 纬度
	 * @param {string} [payload.longitude] 经度
	 * @param {string} [payload.voice]    语音 URL
	 */
	create: (payload) => request({
		url: '/post/create',
		method: 'POST',
		data: payload
	})
}

/**
 * 评论相关接口
 */
export const commentApi = {
	/** 创建评论 */
	create: ({ postId, text }) => request({
		url: '/post-comment/create',
		method: 'POST',
		data: { postId, text }
	}),

	/** 删除评论 */
	delete: (id) => request({
		url: `/post-comment/${id}`,
		method: 'DELETE'
	}),

	/** 评论列表，分页 */
	list: ({ postId, page = 1, pageSize = 20 }) => request({
		url: `/post-comment/list?postId=${encodeURIComponent(postId)}&page=${page}&pageSize=${pageSize}`,
		method: 'GET'
	})
}

/**
 * 管理端（掌柜台）审核相关接口
 */
export const adminApi = {
	/**
	 * 管理端书帖列表，分页
	 * @param {Object} params
	 * @param {number} [params.page=1]
	 * @param {number} [params.pageSize=20]
	 * @param {string} [params.status] 审核状态：A=待审核, B=已通过, C=已驳回。不传 = 待审核
	 */
	postList: ({ page = 1, pageSize = 20, status } = {}) => {
		const qs = `page=${page}&pageSize=${pageSize}` + (status ? `&status=${encodeURIComponent(status)}` : '')
		return request({
			url: `/admin/post/list?${qs}`,
			method: 'GET'
		})
	},

	/**
	 * 管理端评论列表，分页
	 * @param {Object} params
	 * @param {number} [params.page=1]
	 * @param {number} [params.pageSize=20]
	 * @param {string} [params.status] 审核状态：A=待审核, B=已通过, C=已驳回。不传 = 待审核
	 */
	commentList: ({ page = 1, pageSize = 20, status } = {}) => {
		const qs = `page=${page}&pageSize=${pageSize}` + (status ? `&status=${encodeURIComponent(status)}` : '')
		return request({
			url: `/admin/comment/list?${qs}`,
			method: 'GET'
		})
	},

	/**
	 * 管理端书帖审核
	 * @param {Object} params
	 * @param {number|string} params.id 内容 id
	 * @param {string} params.status 审核结果：P=通过, R=驳回
	 * @param {string} [params.reason] 驳回原因
	 */
	postAudit: ({ id, status, reason }) => request({
		url: '/admin/post/audit',
		method: 'POST',
		data: { id, status, reason }
	}),

	/**
	 * 管理端评论审核
	 * @param {Object} params
	 * @param {number|string} params.id 评论 id
	 * @param {string} params.status 审核结果：P=通过, R=驳回
	 * @param {string} [params.reason] 驳回原因
	 */
	commentAudit: ({ id, status, reason }) => request({
		url: '/admin/comment/audit',
		method: 'POST',
		data: { id, status, reason }
	})
}

export default request