import { ref, computed, onMounted } from 'vue'
import { useApi } from './useApi'
import { UPGRADES, getUpgradeCost } from '../config/upgrades'

export function useGameState() {
  const { fetchState, saveState, resetState } = useApi()

  // État réactif
  const population = ref(0)
  const growthRate = ref(0)
  const clickPower = ref(1)

  // Compteur d'achats par upgrade { zone: 2, usine: 1, ... }
  const upgradeCounts = ref({})

  // Rang de la ville
  const cityRank = computed(() => {
    if (population.value < 50) return 'Campement'
    if (population.value < 500) return 'Village'
    if (population.value < 2000) return 'Bourgade'
    if (population.value < 10000) return 'Ville'
    return 'Métropole'
  })

  // Liste des upgrades avec coût actuel calculé
  const upgradesList = computed(() => {
    return UPGRADES.map(upgrade => ({
      ...upgrade,
      count: upgradeCounts.value[upgrade.id] || 0,
      currentCost: getUpgradeCost(upgrade, upgradeCounts.value[upgrade.id] || 0),
      canAfford: population.value >= getUpgradeCost(upgrade, upgradeCounts.value[upgrade.id] || 0)
    }))
  })

  // --- Actions ---

  const buildHouse = () => {
    population.value += clickPower.value
    saveGame()
  }

  const buyUpgrade = (upgradeId) => {
    const upgrade = UPGRADES.find(u => u.id === upgradeId)
    if (!upgrade) return

    const count = upgradeCounts.value[upgradeId] || 0
    const cost = getUpgradeCost(upgrade, count)

    if (population.value >= cost) {
      population.value -= cost
      growthRate.value += upgrade.rateBonus
      upgradeCounts.value[upgradeId] = count + 1
      saveGame()
    }
  }

  const resetGame = async () => {
    if (!confirm('ATTENTION : Cela va effacer définitivement votre ville. Continuer ?')) return
    try {
      await resetState()
      population.value = 0
      growthRate.value = 0
      upgradeCounts.value = {}
    } catch (e) {
      console.error('Erreur Reset', e)
    }
  }

  // --- Persistence ---

  const saveGame = async () => {
    try {
      await saveState({
        trombones: population.value,
        production_rate: growthRate.value,
        upgrades: upgradeCounts.value
      })
    } catch (e) {
      console.error('Erreur Save', e)
    }
  }

  const loadGame = async () => {
    try {
      const data = await fetchState()
      if (data) {
        population.value = data.trombones || 0
        growthRate.value = data.production_rate || 0
        upgradeCounts.value = data.upgrades || {}
      }
      console.log('Jeu rechargé depuis le serveur !')
    } catch (e) {
      console.error('Erreur Load', e)
    }
  }

  // --- Lifecycle ---

  onMounted(() => {
    loadGame()
    // Tick de production chaque seconde
    setInterval(() => {
      if (growthRate.value > 0) {
        population.value += growthRate.value
      }
    }, 1000)
    // Auto-save toutes les 10 secondes
    setInterval(saveGame, 10000)
  })

  return {
    population,
    growthRate,
    clickPower,
    cityRank,
    upgradesList,
    upgradeCounts,
    buildHouse,
    buyUpgrade,
    resetGame,
    loadGame,
    saveGame
  }
}
