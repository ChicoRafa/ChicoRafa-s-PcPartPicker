<template>
    <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 class="text-gray-800 text-xl font-bold mb-4">🛒 Purchase Summary</h3>

            <div class="text-gray-800 mb-4">
                <h4 class="font-semibold mb-2">Your PC Configuration:</h4>
                <ul class="text-sm space-y-1">
                    <li v-for="category in categories" :key="category">
                        <span class="font-medium">{{ category }}:</span>
                        <span class="ml-2">{{ selectedComponents[category]?.name || '❌ Not selected' }}</span>
                    </li>
                </ul>
            </div>

            <div v-if="!isConfigurationComplete"
                class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded mb-4">
                ⚠️ Warning: Missing {{ missingCategories.length }} components: {{ missingCategories.join(', ') }}
            </div>

            <div class="bg-gray-100 p-3 rounded mb-4">
                <div class="flex justify-between items-center">
                    <span class="text-gray-800 font-semibold">Total:</span>
                    <span class="text-2xl font-bold text-green-600">${{ totalPrice }}</span>
                </div>
            </div>

            <div v-if="purchaseCompleted"
                class="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
                🎉 Purchase successful! Order #{{ lastPurchaseId }}
            </div>

            <div class="flex space-x-3">
                <button @click="processPurchase" :disabled="purchaseCompleted"
                    class="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors">
                    {{ purchaseCompleted ? 'Purchased!' : 'Confirm Purchase' }}
                </button>
                <button @click="$emit('close')"
                    class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors">
                    {{ purchaseCompleted ? 'Close' : 'Cancel' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { usePcConfigStore } from '../store/pcConfig'

const props = defineProps({
    isVisible: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'purchase-completed'])

const pcConfigStore = usePcConfigStore()

const selectedComponents = computed(() => pcConfigStore.selectedComponents);
const categories = computed(() => Object.keys(selectedComponents.value).map(category => pcConfigStore.categoryLabels[category] || category));
const purchaseCompleted = ref(false)
const lastPurchaseId = ref(null)

const totalPrice = computed(() => pcConfigStore.totalPrice)
const isConfigurationComplete = computed(() => pcConfigStore.isConfigurationComplete)
const missingCategories = computed(() => pcConfigStore.missingCategories)

const processPurchase = () => {
    try {
        // Simulating purchase process
        const purchase = {
            id: Date.now(),
            components: { ...selectedComponents.value },
            totalPrice: totalPrice.value,
            date: new Date().toISOString(),
            incomplete: !isConfigurationComplete.value,
            missingComponents: missingCategories.value
        }

        // Save to localStorage
        const purchases = JSON.parse(localStorage.getItem('pcPurchases') || '[]')
        purchases.push(purchase)
        localStorage.setItem('pcPurchases', JSON.stringify(purchases))

        lastPurchaseId.value = purchase.id
        purchaseCompleted.value = true

        // Emit event to parent
        emit('purchase-completed', purchase)

        // Auto close after 3 seconds
        setTimeout(() => {
            emit('close')
        }, 3000)

    } catch (error) {
        alert('Error processing purchase. Please try again.')
        console.error('Purchase error:', error)
    }
}

// Reset when modal is closed
watch(() => props.isVisible, (newValue) => {
    if (!newValue) {
        purchaseCompleted.value = false
        lastPurchaseId.value = null
    }
})
</script>