import { defineStore } from 'pinia';
import { apiService } from '../services/apiService.js';
import { compatibilityService } from '../services/compatibilityService.js';

export const usePcConfigStore = defineStore('pcConfig', {
    state: () => ({
        selectedCategory: null,
        selectedComponents: {},
        components: {}, // from API
        categories: [], //from API
        isLoading: false,
        error: null,
        apiAvailable: false,

        compatibilityResults: {
            compatible: true,
            warnings: [],
            errors: [],
            compatibilityMatrix: {}
        },
        recommendations: [],

        // Configuración de validación
        validationEnabled: true,
        showCompatibilityWarnings: true,

        // Mapeo para mostrar nombres bonitos en la UI
        categoryLabels: {
            cpu: 'CPU',
            cooler: 'Cooler',
            gpu: 'GPU',
            ram: 'RAM',
            motherboard: 'Motherboard',
            storage: 'Storage',
            psu: 'Power Supply',
            case: 'Case'
        },
        // Mocked fallback components (keys en minúsculas)
        fallbackComponents: {
            cpu: [
                { id: 1, name: 'Intel Core i5-13400F', price: 180, socket: 'LGA1700', tdp: 65 },
                { id: 2, name: 'AMD Ryzen 5 7600X', price: 220, socket: 'AM5', tdp: 105 },
                { id: 3, name: 'Intel Core i7-13700K', price: 400, socket: 'LGA1700', tdp: 125 }
            ],
            cooler: [
                { id: 16, name: 'Cooler Master Hyper 212', price: 40, tdp: 150, sockets: ['LGA1700', 'AM4', 'AM5'] },
                { id: 17, name: 'Noctua NH-D15', price: 100, tdp: 220, sockets: ['LGA1700', 'AM4', 'AM5'] }
            ],
            gpu: [
                { id: 4, name: 'NVIDIA RTX 4060', price: 300, powerConsumption: 115 },
                { id: 5, name: 'AMD RX 7600', price: 250, powerConsumption: 165 }
            ],
            ram: [
                { id: 6, name: 'Corsair 16GB DDR4', price: 60, type: 'DDR4' },
                { id: 7, name: 'G.Skill 32GB DDR5', price: 150, type: 'DDR5' }
            ],
            motherboard: [
                { id: 8, name: 'ASUS ROG Strix B550-F', price: 200, socket: 'AM4', ramType: 'DDR4', formFactor: 'ATX' },
                { id: 9, name: 'MSI MPG Z490 Gaming Edge', price: 250, socket: 'LGA1700', ramType: 'DDR5', formFactor: 'ATX' }
            ],
            storage: [
                { id: 10, name: 'Samsung 970 EVO Plus 1TB', price: 100, type: 'NVMe SSD' },
                { id: 11, name: 'Western Digital Blue 2TB', price: 60, type: 'HDD', interface: 'SATA III' }
            ],
            psu: [
                { id: 12, name: 'Corsair RM750x', price: 120, wattage: 750, efficiency: '80+ Gold' },
                { id: 13, name: 'EVGA SuperNOVA 650 G5', price: 100, wattage: 650, efficiency: '80+ Gold' }
            ],
            case: [
                { id: 14, name: 'NZXT H510', price: 70, type: 'Mid Tower' },
                { id: 15, name: 'Corsair 4000D Airflow', price: 90, type: 'Mid Tower' }
            ]
        }
    }),

    getters: {
        availableComponents: (state) => {
            if (!state.selectedCategory) return []
            
            const source = state.apiAvailable ? state.components : state.fallbackComponents
            let components = source[state.selectedCategory] || []

            if (state.validationEnabled && Object.keys(state.selectedComponents).length > 0) {
                components = compatibilityService.filterCompatibleComponents(
                    state.selectedCategory,
                    components,
                    state.selectedComponents
                )
            }

            return components
        },

        totalPrice: (state) => {
            return Object.values(state.selectedComponents)
                .reduce((total, component) => total + (component.price || 0), 0)
        },

        // Verifica si la configuración está completa
        isConfigurationComplete: (state) => {
            const requiredCategories = ['cpu', 'cooler', 'gpu', 'ram', 'motherboard', 'storage', 'psu', 'case']
            return requiredCategories.every(category => state.selectedComponents[category])
        },

        // Lista de categorías faltantes
        missingCategories: (state) => {
            const requiredCategories = ['cpu', 'cooler', 'gpu', 'ram', 'motherboard', 'storage', 'psu', 'case']
            return requiredCategories.filter(category => !state.selectedComponents[category])
        },

        formattedCategories: (state) => {
            // Si la API está disponible y hay categorías, usa las de la API
            if (state.apiAvailable && state.categories.length > 0) {
                return state.categories.map(cat => ({
                    key: cat.id,
                    label: state.categoryLabels[cat.id] || cat.id,
                    icon: cat.icon
                }))
            }
            // Si no, usa el mapeo local
            return [
                { key: 'cpu', label: state.categoryLabels['cpu'], icon: '🖥️' },
                { key: 'cooler', label: state.categoryLabels['cooler'], icon: '❄️' },
                { key: 'gpu', label: state.categoryLabels['gpu'], icon: '🎮' },
                { key: 'ram', label: state.categoryLabels['ram'], icon: '💾' },
                { key: 'motherboard', label: state.categoryLabels['motherboard'], icon: '🔧' },
                { key: 'storage', label: state.categoryLabels['storage'], icon: '💿' },
                { key: 'psu', label: state.categoryLabels['psu'], icon: '⚡' },
                { key: 'case', label: state.categoryLabels['case'], icon: '📦' }
            ]
        },

        hasCompatibilityErrors: (state) => {
            return state.compatibilityResults.errors.length > 0
        },

        hasCompatibilityWarnings: (state) => {
            return state.compatibilityResults.warnings.length > 0
        },

        criticalIncompatibilities: (state) => {
            return state.compatibilityResults.errors
        },

        minorWarnings: (state) => {
            return state.compatibilityResults.warnings
        }
    },

    actions: {
        setSelectedCategory(category) {
            this.selectedCategory = category;
        },

        toggleValidation() {
            this.validationEnabled = !this.validationEnabled
        },

        toggleCompatibilityWarnings() {
            this.showCompatibilityWarnings = !this.showCompatibilityWarnings
        },

        validateCurrentConfiguration() {
            this.compatibilityResults = compatibilityService.validateConfiguration(this.selectedComponents)
            this.recommendations = compatibilityService.getRecommendations(this.selectedComponents)
            
            return this.compatibilityResults
        },

        async loadComponentsFromAPI() {
            this.isLoading = true
            this.error = null

            try {
                const isApiHealthy = await apiService.healthCheck()

                if (!isApiHealthy) {
                    throw new Error('API not available')
                }

                this.categories = await apiService.getCategories()

                this.components = await apiService.getAllComponents()

                this.apiAvailable = true

            } catch (error) {
                console.warn('⚠️ Failed to load from API, using fallback data:', error)
                this.apiAvailable = false
                this.components = this.fallbackComponents
                this.error = 'Using offline data - API not available'
            } finally {
                this.isLoading = false
            }
        },

        saveConfiguration() {
            localStorage.setItem('pcConfiguration', JSON.stringify(this.selectedComponents))
        },

        loadConfiguration() {
            try {
                const saved = localStorage.getItem('pcConfiguration')
                if (saved) {
                    this.selectedComponents = JSON.parse(saved)
                    this.validateCurrentConfiguration()
                }
            } catch (error) {
                console.error('❌ Error loading configuration from localStorage:', error)
                this.selectedComponents = {}
            }
        },

         async loadFullConfiguration() {
            this.isLoading = true
            
            try {
                await this.loadComponentsFromAPI()
                this.loadConfiguration()
            } catch (error) {
                this.error = 'Error loading configuration'
                console.error('❌ Error in loadFullConfiguration:', error)
            } finally {
                this.isLoading = false
            }
        },

        clearConfiguration() {
            this.selectedComponents = {};
            this.compatibilityResults = {
                compatible: true,
                warnings: [],
                errors: [],
                compatibilityMatrix: {}
            }
            this.recommendations = [];
            this.saveConfiguration();
        },

        selectedComponentsCount() {
            return Object.keys(this.selectedComponents).length
        },

        addComponent(category, component) {
            //validate using temoporal configuration
            const tempConfig = { ...this.selectedComponents, [category]: component }
            
            if (this.validationEnabled) {
                const validation = compatibilityService.validateConfiguration(tempConfig)
                
                // If critical incompatibilities, ask user
                if (!validation.compatible && validation.errors.length > 0) {
                    const confirmMessage = `⚠️ INCOMPATIBILITY DETECTED:\n\n${validation.errors.join('\n')}\n\nDo you wish to add it anyway?`
                    if (!confirm(confirmMessage)) {
                        console.warn('❌ Component addition cancelled due to incompatibility')
                        return false
                    }
                }
            }

            this.selectedComponents[category] = component
            this.validateCurrentConfiguration()
            this.saveConfiguration()
            
            // Show warnings if any
            if (this.showCompatibilityWarnings && this.compatibilityResults.warnings.length > 0) {
                console.warn('⚠️ Compatibility warnings:', this.compatibilityResults.warnings)
            }
            
            return true
        },

        removeComponent(category) {
            const removed = this.selectedComponents[category]
            delete this.selectedComponents[category]

            // Re-validate configuration
            this.validateCurrentConfiguration()
            
            this.saveConfiguration()
        },

        purchaseConfiguration() {
            // Simulated purchase - here you could send to an APIç
            const validation = this.validateCurrentConfiguration()
            const purchase = {
                id: Date.now(), // Simple unique ID
                components: { ...this.selectedComponents },
                totalPrice: this.totalPrice,
                date: new Date().toISOString(),
                incomplete: !this.isConfigurationComplete,
                missingComponents: this.missingCategories,
                compatibility: validation,
                hasCompatibilityIssues: !validation.compatible || validation.warnings.length > 0
            }

            // Save to localStorage (simulate purchase history)
            const purchases = JSON.parse(localStorage.getItem('pcPurchases') || '[]')
            purchases.push(purchase)
            localStorage.setItem('pcPurchases', JSON.stringify(purchases))

            return purchase
        },

        //TODO: not used yet
        getPurchaseHistory() {
            return JSON.parse(localStorage.getItem('pcPurchases') || '[]')
        }
    }
});

