import { createApp } from 'vue'
import App from './App.vue'
import installElementPlus from './plugins/element'
import Router from './router/index'

const app = createApp(App)
installElementPlus(app)
app.use(Router)
app.mount('#app')