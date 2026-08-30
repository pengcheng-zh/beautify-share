/**
 * 时间与文案格式化工具
 */

export function formatTime(ts) {
	if (!ts) return ''
	const now = Date.now()
	const diff = now - ts
	const minute = 60 * 1000
	const hour = 60 * minute
	const day = 24 * hour

	if (diff < minute) return '刚刚'
	if (diff < hour) return Math.floor(diff / minute) + '分钟前'
	if (diff < day) return Math.floor(diff / hour) + '小时前'
	if (diff < 2 * day) return '昨天 ' + pad(new Date(ts).getHours()) + ':' + pad(new Date(ts).getMinutes())

	const d = new Date(ts)
	const today = new Date()
	if (d.getFullYear() === today.getFullYear()) {
		return (d.getMonth() + 1) + '月' + d.getDate() + '日'
	}
	return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日'
}

export function formatDate(ts) {
	if (!ts) return ''
	const d = new Date(ts)
	return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日'
}

function pad(n) {
	return n < 10 ? '0' + n : '' + n
}

export function statusText(status) {
	const map = {
		pending: '待审核',
		approved: '已通过',
		rejected: '未通过'
	}
	return map[status] || status
}

export function statusClass(status) {
	const map = {
		pending: 'st-pending',
		approved: 'st-approved',
		rejected: 'st-rejected'
	}
	return map[status] || ''
}

export function greeting() {
	const h = new Date().getHours()
	if (h < 6) return '夜深了'
	if (h < 12) return '晨起读书'
	if (h < 18) return '午后翻书'
	return '灯下展卷'
}
