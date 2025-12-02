import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './assets/tailwind.css'
import './permission' // 引入权限控制脚本
import { useRouter } from 'vue-router'
import hasPermi from './directive/hasPermi'

const $router = useRouter()
import router from './router'
import store from './store'
import plugins from './plugins'
import App from './App.vue'
const app = createApp(App)

app.config.globalProperties.$router = $router
// 注册全局指令

app.directive('hasPermi', hasPermi)

app.use(router)
app.use(store)
app.use(plugins)
// 全局引入icon
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus, {
  size: 'default',
  zIndex: 3000,
  locale: zhCn,
})

app.mount('#app')
