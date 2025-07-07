import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Configurator from './views/Configurator.vue'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: Home },
  { path: '/configurator', component: Configurator }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
