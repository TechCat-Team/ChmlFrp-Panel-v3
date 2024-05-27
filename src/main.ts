import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import '@/assets/styles/themes.css';

const app = createApp(App)

import naive from 'naive-ui'
// 通用字体
import 'vfonts/Lato.css'
// 等宽字体
import 'vfonts/FiraCode.css'

app.use(naive)
app.use(createPinia())
app.use(router)
app.mount('#app')
