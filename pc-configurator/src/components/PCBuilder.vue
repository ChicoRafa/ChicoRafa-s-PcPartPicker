<template>
    <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center min-h-[200px]">
        <div v-for="category in categories" :key="category">
            <div v-if="selectedComponents[category]" 
                 class="flex justify-between">
                <span>{{ pcStore.categoryLabels[category] }}:</span>
                <span>${{ selectedComponents[category].price }}</span>
                            </div>
                        </div>
        <h3 class="text-lg text-gray-800 font-bold mb-2">Your PC</h3>

        <!-- Compatibility alerts -->
        <CompatibilityAlertComponent :showAlerts="selectedComponentsCount > 1" class="w-full mb-4" />

        <!-- Progress bar -->
        <div class="w-full mb-4">
            <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{{ selectedComponentsCount }}/8 components</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${(selectedComponentsCount / 8) * 100}%` }">
                </div>
            </div>
        </div>

        <!-- General compatibility status -->
        <div v-if="selectedComponentsCount > 1" class="w-full mb-4">
            <div :class="getCompatibilityStatusClass()" 
                 class="p-2 rounded-lg text-center text-sm">
                <div class="flex items-center justify-center space-x-2">
                    <span v-if="pcStore.compatibilityResults.compatible">
                        ✅ <strong>Compatible</strong>
                    </span>
                    <span v-else>
                        ❌ <strong>Issues detected</strong>
                    </span>
                    
                    <!-- PSU power indicator -->
                    <span v-if="selectedComponents.gpu && selectedComponents.psu" 
                          :class="getPowerStatusClass()"
                          class="text-xs px-2 py-1 rounded">
                        {{ getPowerStatus() }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Warning if incomplete -->
        <div v-if="!isConfigurationComplete && selectedComponentsCount > 0"
            class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded mb-4 w-full text-center text-sm">
            ⚠️ Missing: {{ missingCategories.join(', ') }}
        </div>

        <ul class="text-gray-700 mb-4 w-full">
            <li v-for="category in categories" :key="category" class="flex flex-col items-center mb-3">
                <div class="w-full flex items-center justify-between">
                    <div class="flex-1">
                        <div class="font-bold text-center">{{ pcStore.categoryLabels[category] }}</div>
                        <div class="font-semibold text-center mb-1 text-sm">
                            {{ selectedComponents[category]?.name || '-' }}
                        </div>
                        <div v-if="selectedComponents[category]" class="text-center text-xs text-gray-500">
                            ${{ selectedComponents[category].price }}
                        </div>
                    </div>
                    
                    <!-- Component compatibility indicator -->
                    <div class="flex items-center space-x-2">
                        <div v-if="selectedComponents[category] && selectedComponentsCount > 1"
                             :class="getComponentCompatibilityClass(category)"
                             class="w-3 h-3 rounded-full"
                             :title="getComponentCompatibilityTitle(category)">
                        </div>
                        
                        <button v-if="selectedComponents[category]" 
                                @click="removeComponent(category)" 
                                class="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 text-red-600 text-xs flex items-center justify-center transition-colors"
                                title="Remove component">
                            ×
                        </button>
                    </div>
                </div>
                
                <hr v-if="category !== categories[categories.length - 1]"
                    class="w-full border-t border-gray-200 my-2" />
            </li>
        </ul>

        <!-- Total price with breakdown -->
        <div class="w-full mb-4">
            <div class="text-gray-800 font-bold text-xl text-center mb-2">
                Total: ${{ totalPrice }}
            </div>
            
            <!-- Price breakdown by category -->
            <!--
            <div v-if="selectedComponentsCount > 0" class="text-xs text-gray-600">
              <details class="cursor-pointer">
                <summary class="text-center hover:text-gray-800">View breakdown</summary>
                <div class="mt-2 space-y-1">
                  <div v-for="category in categories" :key="category">
                    <div v-if="selectedComponents[category]" 
                       class="flex justify-between">
                      <span>{{ pcStore.categoryLabels[category] }}:</span>
                      <span>${{ selectedComponents[category].price }}</span>
                    </div>
                  </div>
                </div>
              </details>
            </div>
            -->
        </div>

        <!-- Action buttons -->
        <div class="flex flex-col space-y-2 w-full">
            <!-- Purchase button -->
            <button v-if="selectedComponentsCount > 0" 
                    @click="handlePurchase"
                    :class="getPurchaseButtonClass()"
                    class="w-full font-bold px-4 py-2 rounded transition-colors">
                {{ getPurchaseButtonText() }}
            </button>

            <!-- Clear button -->
            <button v-if="selectedComponentsCount > 0" 
                    @click="clearAll"
                    class="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors">
                Clear All
            </button>

            <!-- Configuration buttons -->
            <div v-if="selectedComponentsCount > 0" class="flex space-x-2">
                <button @click="pcStore.toggleValidation()"
                        :class="pcStore.validationEnabled ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'"
                        class="flex-1 px-3 py-1 rounded text-sm transition-colors">
                    {{ pcStore.validationEnabled ? '✓ Validation' : '✗ Validation' }}
                </button>
                
                <button @click="exportConfiguration"
                        class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors">
                    Export
                </button>
            </div>
        </div>

        <!-- Empty state -->
        <div v-if="selectedComponentsCount === 0" class="text-gray-500 text-center mt-4">
            <div class="mb-2">
                <svg class="w-12 h-12 mx-auto text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
            </div>
            <p>🛍️ No components selected yet</p>
            <p class="text-sm">Start by choosing a category</p>
        </div>
    </div>

    <PurchaseComponent :isVisible="showPurchaseComponent" @close="showPurchaseComponent = false"
        @purchase-completed="onPurchaseCompleted" />
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePcConfigStore } from '../store/pcConfig'
import { compatibilityService } from '../services/compatibilityService'
import PurchaseComponent from './PurchaseComponent.vue'
import CompatibilityAlertComponent from './CompatibilityAlertComponent.vue'

const pcStore = usePcConfigStore()
const categories = ['cpu', 'gpu', 'ram', 'motherboard', 'storage', 'psu', 'case', 'cooler']

// Modal state
const showPurchaseComponent = ref(false)

// Computed properties
const selectedComponents = computed(() => pcStore.selectedComponents)
const totalPrice = computed(() => pcStore.totalPrice)
const selectedComponentsCount = computed(() => Object.keys(selectedComponents.value).length)
const isConfigurationComplete = computed(() => pcStore.isConfigurationComplete)
const missingCategories = computed(() => pcStore.missingCategories)

const getCompatibilityStatusClass = () => {
  if (pcStore.compatibilityResults.compatible) {
    return 'bg-green-50 border border-green-200 text-green-800'
  } else {
    return 'bg-red-50 border border-red-200 text-red-800'
  }
}

const getComponentCompatibilityClass = (category) => {
  if (!selectedComponents.value[category]) return 'bg-gray-300'
  
  // Verify specific component compatibility
  const tempConfig = { ...selectedComponents.value }
  delete tempConfig[category] // Remove current component
  tempConfig[category] = selectedComponents.value[category] // Add it back to test
  
  const validation = compatibilityService.validateConfiguration(tempConfig)
  
  // Check if this specific component causes problems
  const hasIssuesWithThisComponent = validation.errors.some(error => 
    error.toLowerCase().includes(selectedComponents.value[category].name.toLowerCase())
  )
  
  if (hasIssuesWithThisComponent) return 'bg-red-500'
  if (validation.warnings.some(warning => 
    warning.toLowerCase().includes(selectedComponents.value[category].name.toLowerCase())
  )) return 'bg-yellow-500'
  
  return 'bg-green-500'
}

const getComponentCompatibilityTitle = (category) => {
  if (!selectedComponents.value[category]) return ''
  
  const componentClass = getComponentCompatibilityClass(category)
  if (componentClass.includes('red')) return 'Incompatible'
  if (componentClass.includes('yellow')) return 'Warning'
  return 'Compatible'
}

const getPowerStatusClass = () => {
  const gpu = selectedComponents.value.gpu
  const psu = selectedComponents.value.psu
  
  if (!gpu || !psu) return 'bg-gray-100 text-gray-600'
  
  const estimatedConsumption = gpu.powerConsumption + 150
  const recommendedPsu = estimatedConsumption * 1.2
  
  if (psu.wattage >= recommendedPsu) return 'bg-green-100 text-green-700'
  if (psu.wattage >= estimatedConsumption) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

const getPowerStatus = () => {
  const gpu = selectedComponents.value.gpu
  const psu = selectedComponents.value.psu
  
  if (!gpu || !psu) return ''
  
  const estimatedConsumption = gpu.powerConsumption + 150
  const recommendedPsu = estimatedConsumption * 1.2
  
  if (psu.wattage >= recommendedPsu) return '⚡ PSU OK'
  if (psu.wattage >= estimatedConsumption) return '⚠️ PSU Tight'
  return '❌ PSU Insufficient'
}

const getPurchaseButtonClass = () => {
  if (pcStore.hasCompatibilityErrors) {
    return 'bg-red-500 hover:bg-red-600 text-white'
  } else if (pcStore.hasCompatibilityWarnings) {
    return 'bg-yellow-500 hover:bg-yellow-600 text-white'
  } else {
    return 'bg-green-500 hover:bg-green-600 text-white'
  }
}

const getPurchaseButtonText = () => {
  if (pcStore.hasCompatibilityErrors) {
    return `⚠️ Buy with issues ($${totalPrice.value})`
  } else if (pcStore.hasCompatibilityWarnings) {
    return `⚡ Buy with warnings ($${totalPrice.value})`
  } else {
    return `🛒 Buy ($${totalPrice.value})`
  }
}

const handlePurchase = () => {
  // Validate before showing purchase modal
  pcStore.validateCurrentConfiguration()
  
  // If there are critical errors, confirm with user
  if (pcStore.hasCompatibilityErrors) {
    const confirmMessage = `⚠️ COMPATIBILITY ISSUES DETECTED:\n\n${pcStore.criticalIncompatibilities.join('\n')}\n\nDo you want to continue with the purchase anyway?`
    
    if (!confirm(confirmMessage)) {
      return
    }
  }
  
  showPurchaseComponent.value = true
}

const removeComponent = (category) => {
  pcStore.removeComponent(category)
}

const clearAll = () => {
  if (confirm('Are you sure you want to remove the whole configuration?')) {
    pcStore.clearConfiguration()
  }
}

const exportConfiguration = () => {
  const config = {
    components: selectedComponents.value,
    totalPrice: totalPrice.value,
    compatibility: pcStore.compatibilityResults,
    timestamp: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pc-config-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
const onPurchaseCompleted = (purchase) => {
    pcStore.clearConfiguration()
}
</script>