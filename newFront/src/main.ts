import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 创建pinia实例
const pinia = createPinia()
const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) { // 导入所有图标并全局注册
  app.component(key, component)
}
app.use(pinia).use(router).mount('#app')
