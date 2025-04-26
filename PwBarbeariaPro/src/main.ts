import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import '@/assets/css/app.css'

import 'bootstrap'

// Importe os ícones
// import feather from 'feather-icons'

const app = createApp(App)

app.use(router)

app.mount('#app')

// feather.replace()