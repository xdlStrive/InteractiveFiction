import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// 创建pinia实例
const pinia = createPinia()
console.log('000');
createApp(App).use(pinia).use(router).mount('#app')
