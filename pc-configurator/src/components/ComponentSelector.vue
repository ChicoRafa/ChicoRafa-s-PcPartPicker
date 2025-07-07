<template>
  <div class="bg-white rounded-xl shadow p-4 flex flex-col min-h-[200px]">
    <!-- Header with title and controls -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold">
        {{ selectedCategory ? `${pcStore.categoryLabels[selectedCategory]} Components` : 'Select a category' }}
      </h3>
      
      <!-- Filtering controls -->
      <div v-if="selectedCategory" class="flex items-center space-x-2">
        <!-- Validation toggle -->
        <button @click="pcStore.toggleValidation()"
                :class="pcStore.validationEnabled ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'"
                class="px-2 py-1 rounded text-xs font-medium transition-colors"
                :title="pcStore.validationEnabled ? 'Disable compatibility filter' : 'Enable compatibility filter'">
          {{ pcStore.validationEnabled ? '✓' : '✗' }} Filter
        </button>
        
        <!-- Component counter -->
        <span class="text-xs text-gray-500">
          {{ filteredComponents.length }} components
        </span>
      </div>
    </div>

    <!-- Search bar -->
    <div v-if="selectedCategory && availableComponents.length > 3" class="mb-4">
      <input v-model="searchQuery"
             placeholder="Search component..."
             class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black">
    </div>

    <!-- Empty state -->
    <div v-if="!selectedCategory" class="flex-1 flex items-center justify-center">
      <div class="text-center text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V4z" clip-rule="evenodd" />
        </svg>
        <p>Choose a category to see available components</p>
      </div>
    </div>

    <!-- Filtering information -->
    <div v-else-if="pcStore.validationEnabled && availableComponents.length !== allComponents.length" 
         class="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
      <div class="flex items-center text-blue-700">
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <span>
          Showing only compatible components
          ({{ filteredComponents.length }}/{{ allComponents.length }})
        </span>
      </div>
    </div>

    <!-- Component list -->
    <div v-if="selectedCategory" class="flex-1 overflow-y-auto">
      <div v-if="filteredComponents.length === 0" class="flex items-center justify-center h-32">
        <div class="text-center text-gray-500">
          <p v-if="searchQuery">No matching components found"{{ searchQuery }}"</p>
          <p v-else-if="pcStore.validationEnabled">No compatible components available</p>
          <p v-else>No components available</p>
        </div>
      </div>
      
      <div v-else class="space-y-3">
        <ComponentCard
          v-for="component in filteredComponents"
          :key="component.id"
          :component="component"
          :category="selectedCategory"
          :onClick="(comp) => addComponent(selectedCategory, comp)"
          :showCompatibilityIndicator="pcStore.validationEnabled"
          :showCompatibilityWarning="true"
        />
      </div>
    </div>

    <!-- Footer with additional information -->
    <div v-if="selectedCategory && pcStore.recommendations.length > 0" 
         class="mt-4 pt-3 border-t border-gray-200">
      <div class="text-xs text-gray-600">
        <span class="font-medium">💡 Tip:</span>
        {{ getRecommendationForCategory() }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePcConfigStore } from '../store/pcConfig'
import ComponentCard from './ComponentCard.vue'

// Props
const props = defineProps({
  selectedCategory: { type: String, required: false },
  availableComponents: { type: Array, required: true },
  addComponent: { type: Function, required: true }
})

// Store
const pcStore = usePcConfigStore()

// Local state
const searchQuery = ref('')

// Computed properties
const allComponents = computed(() => {
  if (!props.selectedCategory) return []
  
  const source = pcStore.apiAvailable ? pcStore.components : pcStore.fallbackComponents
  return source[props.selectedCategory] || []
})

const filteredComponents = computed(() => {
  let components = props.availableComponents

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    components = components.filter(comp => 
      comp.name.toLowerCase().includes(query) ||
      comp.brand?.toLowerCase().includes(query) ||
      comp.features?.some(feature => feature.toLowerCase().includes(query))
    )
  }

  return components
})


const getRecommendationForCategory = () => {
  const categoryRecommendation = pcStore.recommendations.find(rec => 
    rec.category === props.selectedCategory
  )
  
  return categoryRecommendation ? categoryRecommendation.message : ''
}
</script>