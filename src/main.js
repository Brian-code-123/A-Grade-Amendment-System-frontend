import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import Oruga from '@oruga-ui/oruga-next'
import VueApexCharts from 'vue3-apexcharts'
import { bootstrapConfig } from '@oruga-ui/theme-bootstrap'
import '@oruga-ui/theme-bootstrap/dist/bootstrap.css'
import '@mdi/font/css/materialdesignicons.min.css'
import 'bootstrap'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Oruga, bootstrapConfig)
app.use(VueApexCharts)

app.mount('#app')