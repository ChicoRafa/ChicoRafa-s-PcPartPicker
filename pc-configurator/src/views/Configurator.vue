<template>
    <div class="flex bg-gray-100 overflow-hidden rounded-3xl"
        :style="{ minHeight: `calc(100vh - var(--header-height, 5.5rem))` }">
        <div class="w-full flex flex-col p-8 pt-12">
            <div class="flex items-center justify-between mb-4">
                <span class="mx-15"></span>
                <div class ="flex padding-left-2">
                    <p class="text-gray-700">Create your custom PC by selecting compatible components.</p>
                </div>
                <!-- Compatibility control panel -->
                <div class="flex items-center space-x-3">
                    <div class="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                        <span class="text-sm text-gray-600">Validation:</span>
                        <button @click="pcConfigStore.toggleValidation()"
                                :class="pcConfigStore.validationEnabled ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'"
                                class="px-2 py-1 rounded text-xs font-medium transition-colors">
                            {{ pcConfigStore.validationEnabled ? 'ON' : 'OFF' }}
                        </button>
                    </div>
                    
                    <!-- Overall status indicator -->
                    <div v-if="pcConfigStore.selectedComponentsCount > 1" 
                         :class="getOverallStatusClass()"
                         class="px-3 py-2 rounded-lg text-sm font-medium">
                        {{ getOverallStatusText() }}
                    </div>
                </div>
            </div>

            <!-- Global compatibility alerts -->
            <div v-if="pcConfigStore.selectedComponentsCount > 1" class="mb-6">
                <CompatibilityAlerts />
            </div>

            <!-- Main grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full h-full">
                <!-- Left column: Categories -->
                <ComponentCategory 
                    :categories="pcConfigStore.formattedCategories"
                    :selectedCategory="pcConfigStore.selectedCategory"
                    :setSelectedCategory="pcConfigStore.setSelectedCategory" 
                />
                
                <!-- Center column: Component selector -->
                <ComponentSelector
                    :selectedCategory="pcConfigStore.selectedCategory"
                    :availableComponents="pcConfigStore.availableComponents"
                    :addComponent="handleAddComponent"
                />
                
                <!-- Right column: PC builder -->
                <PCBuilder />
            </div>

            <!-- Additional information panel -->
            <div v-if="pcConfigStore.selectedComponentsCount > 0" 
                 class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <!-- Performance estimation -->
                <div class="bg-white rounded-lg p-4 shadow-sm">
                    <h4 class="font-semibold text-gray-800 mb-2">📊 Performance Estimation</h4>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span>Gaming 1080p:</span>
                            <span :class="getPerformanceClass('1080p')">{{ getPerformanceRating('1080p') }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Gaming 1440p:</span>
                            <span :class="getPerformanceClass('1440p')">{{ getPerformanceRating('1440p') }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Productivity:</span>
                            <span :class="getPerformanceClass('productivity')">{{ getPerformanceRating('productivity') }}</span>
                        </div>
                    </div>
                </div>

                <!-- Power consumption -->
                <div class="bg-white rounded-lg p-4 shadow-sm">
                    <h4 class="font-semibold text-gray-800 mb-2">⚡ Power Consumption</h4>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span>Estimated:</span>
                            <span class="font-medium">~{{ getEstimatedPowerConsumption() }}W</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Recommended PSU:</span>
                            <span class="font-medium">{{ getRecommendedPSU() }}W</span>
                        </div>
                        <div v-if="pcConfigStore.selectedComponents.psu" class="flex justify-between">
                            <span>Selected PSU:</span>
                            <span :class="getPSUStatusClass()">{{ pcConfigStore.selectedComponents.psu.wattage }}W</span>
                        </div>
                    </div>
                </div>

                <!-- Quick suggestions -->
                <div class="bg-white rounded-lg p-4 shadow-sm">
                    <h4 class="font-semibold text-gray-800 mb-2">💡 Suggestions</h4>
                    <div class="space-y-2 text-sm">
                        <div v-for="suggestion in getQuickSuggestions()" :key="suggestion.text"
                             class="flex items-start">
                            <span class="text-blue-500 mr-2">•</span>
                            <span>{{ suggestion.text }}</span>
                        </div>
                        <div v-if="getQuickSuggestions().length === 0" class="text-gray-500 italic">
                            Your configuration looks good! 👍
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePcConfigStore } from '../store/pcConfig'
import ComponentSelector from '../components/ComponentSelector.vue'
import ComponentCategory from '../components/ComponentCategory.vue'
import PCBuilder from '../components/PCBuilder.vue'
import CompatibilityAlerts from '../components/CompatibilityAlertComponent.vue'

const pcConfigStore = usePcConfigStore()

// Computed properties
const getOverallStatusClass = () => {
    if (pcConfigStore.hasCompatibilityErrors) {
        return 'bg-red-100 text-red-800 border border-red-200'
    } else if (pcConfigStore.hasCompatibilityWarnings) {
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
    } else {
        return 'bg-green-100 text-green-800 border border-green-200'
    }
}

const getOverallStatusText = () => {
    if (pcConfigStore.hasCompatibilityErrors) {
        return '❌ Issues detected'
    } else if (pcConfigStore.hasCompatibilityWarnings) {
        return '⚠️ Warnings'
    } else {
        return '✅ All compatible'
    }
}

// Methods
const handleAddComponent = (category, component) => {
    const success = pcConfigStore.addComponent(category, component)
    
    if (success) {
        // Optional: smooth scroll to PCBuilder on mobile
        if (window.innerWidth < 768) {
            setTimeout(() => {
                const pcBuilder = document.querySelector('.grid > div:last-child')
                if (pcBuilder) {
                    pcBuilder.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                }
            }, 100)
        }
    }
}

// Performance estimations
const getPerformanceRating = (type) => {
    const cpu = pcConfigStore.selectedComponents.cpu
    const gpu = pcConfigStore.selectedComponents.gpu
    
    if (!cpu || !gpu) return 'N/A'
    
    // Simplified performance estimation logic
    let score = 0
    
    // Score based on CPU
    if (cpu.cores >= 8) score += 3
    else if (cpu.cores >= 6) score += 2
    else score += 1
    
    // Score based on GPU (use price as performance proxy)
    if (gpu.price >= 500) score += 3
    else if (gpu.price >= 300) score += 2
    else score += 1
    
    // Adjust according to resolution
    if (type === '1440p') score -= 1
    if (type === 'productivity' && cpu.cores >= 8) score += 1
    
    if (score >= 5) return 'Excellent'
    if (score >= 4) return 'Very Good'
    if (score >= 3) return 'Good'
    if (score >= 2) return 'Acceptable'
    return 'Basic'
}

const getPerformanceClass = (type) => {
    const rating = getPerformanceRating(type)
    switch (rating) {
        case 'Excellent': return 'text-green-600 font-semibold'
        case 'Very Good': return 'text-green-500 font-medium'
        case 'Good': return 'text-blue-500'
        case 'Acceptable': return 'text-yellow-500'
        case 'Basic': return 'text-orange-500'
        default: return 'text-gray-500'
    }
}

const getEstimatedPowerConsumption = () => {
    let total = 100 // Base system + motherboard
    
    if (pcConfigStore.selectedComponents.cpu) {
        total += pcConfigStore.selectedComponents.cpu.tdp || 65
    }
    
    if (pcConfigStore.selectedComponents.gpu) {
        total += pcConfigStore.selectedComponents.gpu.powerConsumption || 150
    }
    
    if (pcConfigStore.selectedComponents.ram) {
        total += 10 // RAM consumption
    }
    
    if (pcConfigStore.selectedComponents.storage) {
        total += pcConfigStore.selectedComponents.storage.type === 'HDD' ? 10 : 5
    }
    
    return total
}

const getRecommendedPSU = () => {
    return Math.ceil(getEstimatedPowerConsumption() * 1.3)
}

const getPSUStatusClass = () => {
    const psu = pcConfigStore.selectedComponents.psu
    if (!psu) return 'text-gray-500'
    
    const recommended = getRecommendedPSU()
    
    if (psu.wattage >= recommended) return 'text-green-600 font-semibold'
    if (psu.wattage >= getEstimatedPowerConsumption()) return 'text-yellow-500'
    return 'text-red-500'
}

const getQuickSuggestions = () => {
    const suggestions = []
    const components = pcConfigStore.selectedComponents
    
    // Cooler suggestion
    if (components.cpu && !components.cooler) {
        suggestions.push({ text: 'Add a cooler for your CPU' })
    }
    
    // SSD suggestion
    if (components.storage && components.storage.type === 'HDD') {
        suggestions.push({ text: 'Consider adding an SSD for better performance' })
    }
    
    // RAM suggestion
    if (components.ram && components.ram.capacity === '16GB' && components.gpu && components.gpu.price > 400) {
        suggestions.push({ text: 'With that GPU, consider 32GB of RAM' })
    }
    
    // Modular PSU suggestion
    if (components.psu && !components.psu.modular) {
        suggestions.push({ text: 'A modular PSU will make assembly easier' })
    }
    
    return suggestions.slice(0, 3) // Maximum 3 suggestions
}
</script>