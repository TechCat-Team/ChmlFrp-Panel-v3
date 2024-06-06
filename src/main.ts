import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import '@/assets/styles/themes.css'
import '@/assets/styles/global.css'

const app = createApp(App)

import naive from 'naive-ui'
// 通用字体
import 'vfonts/Lato.css'
// 等宽字体
import 'vfonts/FiraCode.css'

router.beforeEach((to, from, next) => {
    const meta = to.meta as { title?: string; keywords?: string; description?: string };

    if (meta) {
        if (meta.title) {
            document.title = meta.title;
        }
        if (meta.keywords) {
            const keywords = document.querySelector('meta[name="keywords"]');
            if (keywords) {
                keywords.setAttribute('content', meta.keywords);
            } else {
                const metaTag = document.createElement('meta');
                metaTag.name = 'keywords';
                metaTag.content = meta.keywords;
                document.head.appendChild(metaTag);
            }
        }
        if (meta.description) {
            const description = document.querySelector('meta[name="description"]');
            if (description) {
                description.setAttribute('content', meta.description);
            } else {
                const metaTag = document.createElement('meta');
                metaTag.name = 'description';
                metaTag.content = meta.description;
                document.head.appendChild(metaTag);
            }
        }
    }
    next();
});

app.use(naive)
app.use(createPinia())
app.use(router)
app.mount('#app')
