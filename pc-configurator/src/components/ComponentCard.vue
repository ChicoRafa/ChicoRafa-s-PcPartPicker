<template>
  <div @click="handleClick" 
       :class="getCardClasses()"
       class="border rounded-lg p-3 cursor-pointer transition-all duration-200 relative">
    
    <div v-if="showCompatibilityIndicator" 
         :class="getCompatibilityIndicatorClass()"
         class="absolute top-2 right-2 w-3 h-3 rounded-full">
    </div>

    <div class="flex items-start space-x-3">
      <div v-if="component.image" class="flex-shrink-0">
        <img :src="component.image" 
             :alt="component.name"
             class="w-16 h-12 object-cover rounded"
             @error="imageError = true" />
      </div>
      <div v-else class="flex-shrink-0 w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
        <span class="text-gray-400 text-xs">No img</span>
      </div>

      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-gray-800 text-sm leading-tight">
          {{ component.name }}
        </h4>
        
        <!-- Marca -->
        <p v-if="component.brand" class="text-xs text-gray-500 mt-1">
          {{ component.brand }}
        </p>

        <div class="flex flex-wrap gap-1 mt-2">
          <span v-for="spec in keySpecs" :key="spec.label"
                class="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
            {{ spec.label }}: {{ spec.value }}
          </span>
        </div>

        <div v-if="component.features && component.features.length > 0" 
             class="flex flex-wrap gap-1 mt-2">
          <span v-for="feature in component.features.slice(0, 2)" :key="feature"
                class="inline-block px-2 py-1 bg-blue-100 text-xs text-blue-700 rounded">
            {{ feature }}
          </span>
          <span v-if="component.features.length > 2" 
                class="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-500 rounded">
            +{{ component.features.length - 2 }} más
          </span>
        </div>

        <div class="flex items-center justify-between mt-3">
          <p class="text-green-600 font-bold text-lg">
            €{{ component.price }}
          </p>
          
          <button :class="getActionButtonClass()"
                  class="px-3 py-1 rounded text-xs font-medium transition-colors">
            {{ isCompatible ? 'Add' : 'Force' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="!isCompatible && showCompatibilityWarning" 
         class="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
      <div class="flex items-start">
        <span class="text-red-500 mr-1">⚠️</span>
        <div class="text-red-700">
          <p class="font-medium">Incompatibility Detected:</p>
          <ul class="mt-1 space-y-1">
            <li v-for="issue in incompatibilityIssues" :key="issue">
              • {{ issue }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePcConfigStore } from '../store/pcConfig'
import { compatibilityService } from '../services/compatibilityService'

// Props
const props = defineProps({
  component: { type: Object, required: true },
  category: { type: String, required: true },
  onClick: { type: Function, required: true },
  showCompatibilityIndicator: { type: Boolean, default: true },
  showCompatibilityWarning: { type: Boolean, default: true }
})

// Store
const pcStore = usePcConfigStore()

// Estado local
const imageError = ref(false)

// Computed properties
const isCompatible = computed(() => {
  if (!pcStore.validationEnabled || Object.keys(pcStore.selectedComponents).length === 0) {
    return true
  }

  // Crear configuración temporal
  const testConfig = { ...pcStore.selectedComponents, [props.category]: props.component }
  const validation = compatibilityService.validateConfiguration(testConfig)
  
  return validation.compatible
})

const incompatibilityIssues = computed(() => {
  if (isCompatible.value) return []

  const testConfig = { ...pcStore.selectedComponents, [props.category]: props.component }
  const validation = compatibilityService.validateConfiguration(testConfig)
  
  return validation.errors
})

const keySpecs = computed(() => {
  const specs = []
  const comp = props.component

  // Especificaciones según el tipo de componente
  switch (props.category) {
    case 'cpu':
      if (comp.socket) specs.push({ label: 'Socket', value: comp.socket })
      if (comp.cores) specs.push({ label: 'Cores', value: comp.cores })
      if (comp.tdp) specs.push({ label: 'TDP', value: `${comp.tdp}W` })
      break
    
    case 'gpu':
      if (comp.memory) specs.push({ label: 'VRAM', value: comp.memory })
      if (comp.powerConsumption) specs.push({ label: 'Power Consumption', value: `${comp.powerConsumption}W` })
      break
    
    case 'ram':
      if (comp.capacity) specs.push({ label: 'Capacity', value: comp.capacity })
      if (comp.type) specs.push({ label: 'Type', value: comp.type })
      if (comp.speed) specs.push({ label: 'Speed', value: comp.speed })
      break
    
    case 'motherboard':
      if (comp.socket) specs.push({ label: 'Socket', value: comp.socket })
      if (comp.formFactor) specs.push({ label: 'Form Factor', value: comp.formFactor })
      if (comp.ramType) specs.push({ label: 'RAM', value: comp.ramType })
      break
    
    case 'storage':
      if (comp.capacity) specs.push({ label: 'Capacity', value: comp.capacity })
      if (comp.type) specs.push({ label: 'Type', value: comp.type })
      if (comp.readSpeed) specs.push({ label: 'Read Speed', value: comp.readSpeed })
      break
    
    case 'psu':
      if (comp.wattage) specs.push({ label: 'Wattage', value: `${comp.wattage}W` })
      if (comp.efficiency) specs.push({ label: 'Efficiency', value: comp.efficiency })
      if (comp.modular) specs.push({ label: 'Modular', value: comp.modular })
      break
    
    case 'case':
      if (comp.type) specs.push({ label: 'Type', value: comp.type })
      if (comp.color) specs.push({ label: 'Color', value: comp.color })
      break
    
    case 'cooler':
      if (comp.type) specs.push({ label: 'Type', value: comp.type })
      if (comp.tdp) specs.push({ label: 'TDP', value: `${comp.tdp}W` })
      break
  }

  return specs.slice(0, 3) //Maximum 3 key specs
})

const handleClick = () => {
  props.onClick(props.component)
}

const getCardClasses = () => {
  const baseClasses = 'hover:shadow-md'
  
  if (!pcStore.validationEnabled) {
    return `${baseClasses} hover:bg-gray-50 border-gray-200 hover:border-blue-300`
  }

  if (isCompatible.value) {
    return `${baseClasses} hover:bg-green-50 border-gray-200 hover:border-green-300`
  } else {
    return `${baseClasses} hover:bg-red-50 border-red-200 hover:border-red-400`
  }
}

const getCompatibilityIndicatorClass = () => {
  if (!pcStore.validationEnabled) return 'bg-gray-400'
  return isCompatible.value ? 'bg-green-500' : 'bg-red-500'
}

const getActionButtonClass = () => {
  if (!pcStore.validationEnabled || isCompatible.value) {
    return 'bg-blue-500 hover:bg-blue-600 text-white'
  } else {
    return 'bg-red-500 hover:bg-red-600 text-white'
  }
}
</script>