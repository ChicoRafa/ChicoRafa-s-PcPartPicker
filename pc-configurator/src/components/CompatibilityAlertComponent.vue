<template>
  <div v-if="showAlerts" class="space-y-3">
    <div v-if="pcStore.hasCompatibilityErrors" 
         class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-start">
        <div class="text-red-600 mr-3">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex-1">
          <h4 class="text-red-800 font-semibold text-sm mb-2">
            ⚠️ Incompatibilidades Críticas
          </h4>
          <ul class="text-red-700 text-sm space-y-1">
            <li v-for="error in pcStore.criticalIncompatibilities" :key="error" class="flex items-start">
              <span class="text-red-500 mr-2">•</span>
              <span>{{ error }}</span>
            </li>
          </ul>
        </div>
        <button @click="pcStore.toggleValidation()" 
                class="text-red-500 hover:text-red-700 text-sm">
          {{ pcStore.validationEnabled ? 'Desactivar validación' : 'Activar validación' }}
        </button>
      </div>
    </div>

    <div v-if="pcStore.hasCompatibilityWarnings && pcStore.showCompatibilityWarnings" 
         class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div class="flex items-start">
        <div class="text-yellow-600 mr-3">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex-1">
          <h4 class="text-yellow-800 font-semibold text-sm mb-2">
            ⚡ Advertencias de Compatibilidad
          </h4>
          <ul class="text-yellow-700 text-sm space-y-1">
            <li v-for="warning in pcStore.minorWarnings" :key="warning" class="flex items-start">
              <span class="text-yellow-500 mr-2">•</span>
              <span>{{ warning }}</span>
            </li>
          </ul>
        </div>
        <button @click="pcStore.toggleCompatibilityWarnings()" 
                class="text-yellow-500 hover:text-yellow-700 text-sm">
          Ocultar
        </button>
      </div>
    </div>

    <div v-if="pcStore.recommendations.length > 0 && showRecommendations" 
         class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-start">
        <div class="text-blue-600 mr-3">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex-1">
          <h4 class="text-blue-800 font-semibold text-sm mb-2">
            💡 Tips
          </h4>
          <ul class="text-blue-700 text-sm space-y-1">
            <li v-for="rec in pcStore.recommendations" :key="rec.message" 
                :class="getPriorityClass(rec.priority)"
                class="flex items-start">
              <span class="text-blue-500 mr-2">•</span>
              <span>{{ rec.message }}</span>
            </li>
          </ul>
        </div>
        <button @click="showRecommendations = false" 
                class="text-blue-500 hover:text-blue-700 text-sm">
          Hide
        </button>
      </div>
    </div>

    <div v-if="pcStore.selectedComponentsCount > 1" 
         :class="getCompatibilityStatusClass()"
         class="rounded-lg p-3 text-center">
      <div class="flex items-center justify-center space-x-2">
        <span v-if="pcStore.compatibilityResults.compatible" class="text-green-600">
          ✅ Compatible Configuration
        </span>
        <span v-else class="text-red-600">
          ❌ Configuration Issues
        </span>
        
        <button @click="forceValidation" 
                class="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">
          Revalidate
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePcConfigStore } from '../store/pcConfig'

const props = defineProps({
  showAlerts: { type: Boolean, default: true }
})

const pcStore = usePcConfigStore()
const showRecommendations = ref(true)

const getPriorityClass = (priority) => {
  switch (priority) {
    case 'high': return 'font-semibold text-red-700'
    case 'medium': return 'font-medium text-yellow-700'
    case 'low': return 'text-blue-700'
    default: return 'text-blue-700'
  }
}

const getCompatibilityStatusClass = () => {
  if (pcStore.compatibilityResults.compatible) {
    return 'bg-green-50 border border-green-200'
  } else {
    return 'bg-red-50 border border-red-200'
  }
}

const forceValidation = () => {
  pcStore.validateCurrentConfiguration()
}
</script>