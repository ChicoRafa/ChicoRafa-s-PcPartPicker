<script setup>
import { onMounted, ref, nextTick } from 'vue'
import { usePcConfigStore } from './store/pcConfig.js'

const pcStore = usePcConfigStore()
const headerRef = ref(null)
const setHeaderHeight = () => {
  if (headerRef.value) {
    document.documentElement.style.setProperty('--header-height', headerRef.value.offsetHeight + 'px')
  }
}
const initializeApp = async () => {
  try {
    pcStore.loadConfiguration()
  } catch (error) {
    console.error('Error while initializing app:', error)
  }
}
onMounted(() => {
  nextTick(setHeaderHeight)
  window.addEventListener('resize', setHeaderHeight)
  pcStore.loadComponentsFromAPI() // Load components from API
  initializeApp()
})
</script>

<template>
  <header 
    ref="headerRef"
    class="fixed top-0 left-1/2 -translate-x-1/2 flex items-center justify-between p-4 bg-white shadow z-10 rounded-3xl w-11/12">
    <img src="./assets/vue.svg" class="logo vue mr-4" alt="Vue logo" />
    <div class="text-center flex-1">
      <h1 class="text-3xl font-bold text-gray-800">PC Configurator</h1>
    </div>
    <nav class="flex space-x-4 ml-4">
      <router-link 
        to="/home" 
        class="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
        Home
      </router-link>
      <router-link 
        to="/configurator" 
        class="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
        Configurator
      </router-link>
    </nav>
  </header>
  <div :style="{ paddingTop: 'var(--header-height, 5.5rem)' }">
    <router-view />
  </div>
  <footer class="text-center p-2 bg-white shadow rounded-t-lg w-full mt-4">
    <a href="https://github.com/ChicoRafa" target="_blank" class="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
      By ChicoRafa
    </a>
  </footer>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
