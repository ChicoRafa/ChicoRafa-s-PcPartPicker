// src/services/compatibilityService.js

class CompatibilityService {
  constructor() {
    this.validationRules = {
      // Reglas de compatibilidad entre componentes
      cpuMotherboard: this.validateCpuMotherboard.bind(this),
      ramMotherboard: this.validateRamMotherboard.bind(this),
      gpuPowerSupply: this.validateGpuPowerSupply.bind(this),
      cpuCooler: this.validateCpuCooler.bind(this),
      motherboardCase: this.validateMotherboardCase.bind(this),
      storagePowerSupply: this.validateStoragePowerSupply.bind(this)
    }
  }

  // Validar compatibilidad CPU - Motherboard (Socket)
  validateCpuMotherboard(cpu, motherboard) {
    if (!cpu || !motherboard) return { compatible: true, warnings: [] }

    const compatible = cpu.socket === motherboard.socket
    const warnings = compatible ? [] : [
      `The CPU ${cpu.name} (${cpu.socket}) is not compatible with the motherboard ${motherboard.name} (${motherboard.socket})`
    ]

    return { compatible, warnings }
  }

  // Validar compatibilidad RAM - Motherboard (Tipo DDR)
  validateRamMotherboard(ram, motherboard) {
    if (!ram || !motherboard) return { compatible: true, warnings: [] }

    const compatible = ram.type === motherboard.ramType
    const warnings = compatible ? [] : [
      `The RAM ${ram.name} (${ram.type}) is not compatible with the motherboard ${motherboard.name} (${motherboard.ramType})`
    ]

    return { compatible, warnings }
  }

  // Validar GPU - Fuente de alimentación (Potencia)
  validateGpuPowerSupply(gpu, psu) {
    if (!gpu || !psu) return { compatible: true, warnings: [] }

    // Estimación básica: GPU + CPU + resto del sistema
    const estimatedConsumption = gpu.powerConsumption + 150 // 150W para CPU + resto
    const recommendedPsu = estimatedConsumption * 1.2 // 20% de margen
    
    const compatible = psu.wattage >= recommendedPsu
    const warnings = compatible ? [] : [
      `The power supply (${psu.wattage}W) may be insufficient for the GPU ${gpu.name} (${gpu.powerConsumption}W). At least ${Math.ceil(recommendedPsu)}W is recommended.`
    ]

    return { compatible, warnings }
  }

  // Validar CPU - Cooler (Socket y TDP)
  validateCpuCooler(cpu, cooler) {
    if (!cpu || !cooler) return { compatible: true, warnings: [] }

    const socketCompatible = cooler.sockets?.includes(cpu.socket)
    const tdpCompatible = cooler.tdp >= cpu.tdp

    const warnings = []
    
    if (!socketCompatible) {
      warnings.push(`The cooler ${cooler.name} is not compatible with socket ${cpu.socket}`)
    }
    
    if (!tdpCompatible) {
      warnings.push(`The cooler ${cooler.name} (${cooler.tdp}W TDP) may be insufficient for the CPU ${cpu.name} (${cpu.tdp}W TDP)`)
    }

    return { 
      compatible: socketCompatible && tdpCompatible, 
      warnings 
    }
  }

  // Validar Motherboard - Case (Factor de forma)
  validateMotherboardCase(motherboard, pcCase) {
    if (!motherboard || !pcCase) return { compatible: true, warnings: [] }

    // Reglas básicas de compatibilidad de tamaños
    const compatibility = {
      'Mini-ITX': ['Mini-ITX', 'Micro-ATX', 'ATX', 'Mid Tower', 'Full Tower'],
      'Micro-ATX': ['Micro-ATX', 'ATX', 'Mid Tower', 'Full Tower'],
      'ATX': ['ATX', 'Mid Tower', 'Full Tower'],
      'E-ATX': ['Full Tower']
    }

    const supportedFormats = compatibility[motherboard.formFactor] || []
    const compatible = supportedFormats.some(format => 
      pcCase.type?.includes(format) || pcCase.formFactor?.includes(format)
    )

    const warnings = compatible ? [] : [
      `The motherboard ${motherboard.name} (${motherboard.formFactor}) may not fit in the case ${pcCase.name} (${pcCase.type})`
    ]

    return { compatible, warnings }
  }

  // Validar almacenamiento y conectores
  validateStoragePowerSupply(storage, psu, otherComponents = {}) {
    if (!storage || !psu) return { compatible: true, warnings: [] }

    // NVMe no necesita conectores SATA power, los SSD/HDD sí
    if (storage.type === 'NVMe SSD') {
      return { compatible: true, warnings: [] }
    }

    // Para HDD/SSD SATA necesitamos verificar conectores disponibles
    const warnings = []
    
    if (storage.interface === 'SATA III' && !psu.modular) {
      warnings.push(`Check that the power supply ${psu.name} has enough SATA connectors for ${storage.name}`)
    }

    return { compatible: true, warnings }
  }

  // Método principal para validar toda la configuración
  validateConfiguration(components) {
    const results = {
      compatible: true,
      warnings: [],
      errors: [],
      compatibilityMatrix: {}
    }

    const { cpu, motherboard, ram, gpu, psu, cooler, case: pcCase, storage } = components

    // Ejecutar todas las validaciones
    const validations = [
      { name: 'CPU-Motherboard', result: this.validateCpuMotherboard(cpu, motherboard) },
      { name: 'RAM-Motherboard', result: this.validateRamMotherboard(ram, motherboard) },
      { name: 'GPU-PSU', result: this.validateGpuPowerSupply(gpu, psu) },
      { name: 'CPU-Cooler', result: this.validateCpuCooler(cpu, cooler) },
      { name: 'Motherboard-Case', result: this.validateMotherboardCase(motherboard, pcCase) },
      { name: 'Storage-PSU', result: this.validateStoragePowerSupply(storage, psu) }
    ]

    // Procesar resultados
    validations.forEach(validation => {
      results.compatibilityMatrix[validation.name] = validation.result
      
      if (!validation.result.compatible) {
        results.compatible = false
        results.errors.push(...validation.result.warnings)
      } else if (validation.result.warnings.length > 0) {
        results.warnings.push(...validation.result.warnings)
      }
    })

    return results
  }

  // Método para filtrar componentes compatibles
  filterCompatibleComponents(targetCategory, targetComponents, selectedComponents) {
    if (!targetComponents || targetComponents.length === 0) return []

    return targetComponents.filter(component => {
      // Crear configuración temporal para testear
      const testConfig = { ...selectedComponents, [targetCategory]: component }
      const validation = this.validateConfiguration(testConfig)
      
      // Permitir componentes que generen warnings pero no errores críticos
      return validation.compatible || validation.errors.length === 0
    })
  }

  // Obtener recomendaciones basadas en componentes seleccionados
  getRecommendations(selectedComponents) {
    const recommendations = []

    // PSU recommendation based on GPU
    if (selectedComponents.gpu && !selectedComponents.psu) {
      const recommendedWattage = (selectedComponents.gpu.powerConsumption + 150) * 1.2
      recommendations.push({
        category: 'psu',
        message: `It is recommended to use a power supply of at least ${Math.ceil(recommendedWattage)}W for the GPU ${selectedComponents.gpu.name}.`,
        priority: 'high'
      })
    }

    // Cooler recommendation based on CPU
    if (selectedComponents.cpu && !selectedComponents.cooler) {
      const tdpRequirement = selectedComponents.cpu.tdp
      recommendations.push({
        category: 'cooler',
        message: `The CPU ${selectedComponents.cpu.name} requires a cooler that supports at least ${tdpRequirement}W TDP.`,
        priority: 'medium'
      })
    }

    // RAM recommendation based on Motherboard
    if (selectedComponents.motherboard && !selectedComponents.ram) {
      recommendations.push({
        category: 'ram',
        message: `The motherboard supports ${selectedComponents.motherboard.ramType} memory.`,
        priority: 'medium'
      })
    }

    return recommendations
  }
}

export const compatibilityService = new CompatibilityService()
export default compatibilityService