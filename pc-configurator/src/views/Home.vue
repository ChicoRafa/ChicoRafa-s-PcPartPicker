<template>
  <div class="flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 overflow-hidden rounded-3xl" :style="{ height: `calc(100vh - var(--header-height, 5.5rem))` }">
    <div class="w-full max-w-2xl flex flex-col items-center justify-center p-12">
      <img src="../assets/pc-icon.svg" alt="PC Icon" class="w-24 h-24 mb-6 animate-bounce" />
      <h2 class="text-gray-700 text-4xl font-bold mb-6">Welcome</h2>
      <p class="text-gray-700 text-xl mb-8">Select your components to build the perfect PC.</p>
      <router-link to="/configurator" class="bg-blue-500 text-white px-8 py-4 rounded-lg shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all text-lg">Go to Configurator</router-link>
    </div>
  </div>
</template>

<style scoped>
a {
  font-weight: inherit !important;
  color: inherit !important;
  text-decoration: none !important; 
}
router-link {
  color: #ffffff !important;
  text-decoration: none;
}
router-link:hover {
  color: #ffffff !important;
}
router-link:visited {
  color: #ffffff !important;
}
</style>
