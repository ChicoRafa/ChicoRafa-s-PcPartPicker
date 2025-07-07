// src/services/api.js
const API_BASE_URL = 'http://localhost:3000'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  // Método genérico para hacer peticiones
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Obtener todas las categorías
  async getCategories() {
    return await this.request('/categories')
  }

  // Obtener componentes por categoría
  async getComponentsByCategory(category) {
    const normalizedCategory = category.toLowerCase();
    return await this.request(`/components/${normalizedCategory}`)
  }

  // Obtener componente específico por ID
  async getComponentById(category, id) {
    return await this.request(`/components/${category}/${id}`)
  }

  // Obtener todos los componentes de todas las categorías
  async getAllComponents() {
    const categories = await this.getCategories()
    const components = {}

    for (const category of categories) {
      try {
        components[category.id] = await this.getComponentsByCategory(category.id)
      } catch (error) {
        console.warn(`Failed to load components for category ${category.id}:`, error)
        components[category.id] = []
      }
    }

    return components
  }

  // Método para verificar si la API está disponible
  async healthCheck() {
    try {
      await this.request('/categories')
      return true
    } catch (error) {
      console.error('API health check failed:', error)
      return false
    }
  }
}

// Exportar instancia singleton
export const apiService = new ApiService()
export default apiService