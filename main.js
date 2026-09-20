import App from './App'
import { createSSRApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'

export function createApp() {
	const app = createSSRApp(App)
	const pinia = createPinia()
	app.use(pinia)
	// SSR 模式下，createPinia 不会自动 setActivePinia，
	// 必须在 App.vue 的 onLaunch 跑之前显式激活，否则 App / 首页调 useStore() 会报
	// "getActivePinia() was called but there was no active Pinia"
	setActivePinia(pinia)
	return {
		app
	}
}
