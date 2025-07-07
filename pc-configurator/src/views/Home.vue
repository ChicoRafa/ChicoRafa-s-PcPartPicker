<template>
  <div class="flex items-center justify-center bg-gray-100 overflow-hidden rounded-3xl" :style="{ height: `calc(100vh - var(--header-height, 5.5rem))` }">
    <div class="w-full max-w-xl flex flex-col items-center justify-center p-8">
      <h2 class="text-gray-700 text-2xl font-semibold mb-4">Welcome</h2>
      <p class="text-gray-700 mb-6">Select your components to build the perfect PC.</p>
      <router-link to="/configurator" class="text-blue-500 hover:underline">Go to Configurator</router-link>
    </div>
  </div>
</template>
