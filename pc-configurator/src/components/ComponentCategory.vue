<template>
  <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center">
    <h3 class="text-lg font-bold mb-2">Categories</h3>
    <ul class="space-y-2 w-full">
      <li v-for="category in categories" :key="category.key"
          @click="setSelectedCategory(category.key)"
          :class="['text-gray-800 cursor-pointer rounded px-2 py-1 text-center',
            selectedCategory === category.key ? 'bg-blue-500 text-white' : 'hover:bg-gray-200']">
        {{ category.label }}
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({
  categories: { type: Array, required: true },
  selectedCategory: { type: String, required: true },
  setSelectedCategory: { type: Function, required: true }
})
</script>
