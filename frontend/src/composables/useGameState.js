import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useApi } from './useApi'
import { UPGRADES, getUpgradeCost } from '../config/upgrades'
import { BONUSES } from '../config/bonuses'
import { COMBO_CONFIG, SAVE_CONFIG, OFFLINE_CONFIG } from '../config/gameConfig'

export function useGameState() {
  const { fetchState, saveState, resetState } = useApi()

  // Etat réactif
  const population = ref(0)
  const upgradeCounts = ref({})
  const acquiredBonuses = ref([])

  // Tant que l'état serveur n'est pas chargé, on ne sauvegarde pas
  // (sinon un état vide pourrait écraser la sauvegarde existante)
  const isLoaded = ref(false)
  let loadRetryTimer = null

  // Gains accumulés pendant l'absence du joueur ({ seconds, amount } ou null)
  const offlineGain = ref(null)

  // File des sauvegardes : chaque requête part après la précédente,
  // ce qui empêche un état ancien d'écraser un état plus récent
  let saveQueue = Promise.resolve()
  let clickSaveTimer = null

  // Système de Combo
  const comboMultiplier = ref(1.0)
  const comboProgress = ref(0)

  // Paramètres de Combo calculés dynamiquement avec les bonus
  const maxMultiplier = computed(() => {
    let add = 0
    BONUSES.filter(b => b.type === 'combo_max' && acquiredBonuses.value.includes(b.id)).forEach(b => add += b.value)
    return COMBO_CONFIG.MAX_MULTIPLIER + add
  })
  
  const progressOnClick = computed(() => {
    let mult = 1
    BONUSES.filter(b => b.type === 'combo_growth' && acquiredBonuses.value.includes(b.id)).forEach(b => mult *= b.value)
    return COMBO_CONFIG.PROGRESS_ON_CLICK * mult
  })
  
  const decayRate = computed(() => {
    let mult = 1
    BONUSES.filter(b => b.type === 'combo_decay' && acquiredBonuses.value.includes(b.id)).forEach(b => mult *= b.value)
    return COMBO_CONFIG.DECAY_RATE * mult
  })

  const clickMultiplierBonuses = computed(() => {
    let mult = 1
    BONUSES.filter(b => b.type === 'click_multiplier' && acquiredBonuses.value.includes(b.id)).forEach(b => mult *= b.value)
    return mult
  })

  // Puissance de clic de base selon les améliorations
  const baseClickPower = computed(() => {
    let power = 1
    UPGRADES.filter(u => u.type === 'click').forEach(u => {
      const count = upgradeCounts.value[u.id] || 0
      power += count * u.clickBonus
    })
    return power * clickMultiplierBonuses.value
  })

  // Puissance de clic totale (Base * Multiplicateur de combo)
  const clickPower = computed(() => {
    return Math.floor(baseClickPower.value * comboMultiplier.value)
  })

  // Production de population par seconde (totalement réactive désormais)
  const growthRate = computed(() => {
    let rate = 0
    UPGRADES.filter(u => u.type === 'passive').forEach(u => {
      const count = upgradeCounts.value[u.id] || 0
      let mult = 1
      // Multiplicateurs de zone spécifiques provenant des bonus
      BONUSES.filter(b => b.type === 'zone_multiplier' && b.target === u.id && acquiredBonuses.value.includes(b.id))
             .forEach(b => mult *= b.value)
      
      rate += count * (u.rateBonus || 0) * mult
    })
    return rate
  })

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

    // Gérer l'augmentation du combo
    comboProgress.value += progressOnClick.value
    if (comboProgress.value >= 100) {
      if (comboMultiplier.value < maxMultiplier.value) {
        comboMultiplier.value += COMBO_CONFIG.INCREMENT_STEP
        comboProgress.value -= 100 // Garde le reste
      } else {
        comboProgress.value = 100 // Cap à max
      }
    }

    scheduleSave()
  }

  const buyUpgrade = (upgradeId) => {
    const upgrade = UPGRADES.find(u => u.id === upgradeId)
    if (!upgrade) return

    const count = upgradeCounts.value[upgradeId] || 0
    const cost = getUpgradeCost(upgrade, count)

    if (population.value >= cost) {
      population.value -= cost
      upgradeCounts.value[upgradeId] = count + 1
      saveGame()
    }
  }

  const buyBonus = (bonusId) => {
    const bonus = BONUSES.find(b => b.id === bonusId)
    if (!bonus || acquiredBonuses.value.includes(bonusId)) return

    if (population.value >= bonus.cost) {
      population.value -= bonus.cost
      acquiredBonuses.value.push(bonusId)
      saveGame()
    }
  }

  const resetGame = async () => {
    if (!confirm('ATTENTION : Cela va effacer définitivement votre ville. Continuer ?')) return
    try {
      // Le reset passe aussi par la file pour qu'une sauvegarde en cours
      // ne recrée pas l'ancienne partie juste après
      clearTimeout(clickSaveTimer)
      const reset = saveQueue.then(resetState)
      saveQueue = reset.catch(() => {})
      await reset
      population.value = 0
      comboMultiplier.value = 1.0
      comboProgress.value = 0
      upgradeCounts.value = {}
      acquiredBonuses.value = []
    } catch (e) {
      console.error('Erreur Reset', e)
    }
  }

  // --- Persistence ---

  // L'état est lu au moment de l'envoi, donc toujours le plus récent
  const buildSnapshot = () => ({
    trombones: population.value,
    upgrades: upgradeCounts.value,
    bonuses: acquiredBonuses.value
  })

  const saveGame = () => {
    if (!isLoaded.value) return saveQueue
    clearTimeout(clickSaveTimer)
    saveQueue = saveQueue.then(async () => {
      try {
        await saveState(buildSnapshot())
      } catch (e) {
        console.error('Erreur Save', e)
      }
    })
    return saveQueue
  }

  // Les clics sont fréquents : on sauvegarde un peu après le dernier
  const scheduleSave = () => {
    if (!isLoaded.value) return
    clearTimeout(clickSaveTimer)
    clickSaveTimer = setTimeout(saveGame, SAVE_CONFIG.CLICK_SAVE_DELAY)
  }

  // Envoi direct (hors file) quand la page est masquée ou fermée :
  // elle peut disparaître avant la fin d'une sauvegarde en cours
  const flushSave = () => {
    if (!isLoaded.value) return
    clearTimeout(clickSaveTimer)
    saveState(buildSnapshot(), { keepalive: true })
      .catch(e => console.error('Erreur Save', e))
  }

  const loadGame = async () => {
    try {
      const data = await fetchState()
      if (data) {
        population.value = data.trombones || 0
        upgradeCounts.value = data.upgrades || {}
        acquiredBonuses.value = data.bonuses || []
        applyOfflineGain(data.offline_seconds || 0)
      }
      isLoaded.value = true
      console.log('Jeu rechargé depuis le serveur !')
    } catch (e) {
      console.error('Erreur Load', e)
      // Premier chargement raté : on réessaie plus tard
      if (!isLoaded.value) {
        clearTimeout(loadRetryTimer)
        loadRetryTimer = setTimeout(loadGame, SAVE_CONFIG.LOAD_RETRY_DELAY)
      }
    }
  }

  // Production pendant l'absence, calculée depuis la dernière sauvegarde serveur
  const applyOfflineGain = (offlineSeconds) => {
    const seconds = Math.min(offlineSeconds, OFFLINE_CONFIG.MAX_SECONDS)
    const amount = growthRate.value * seconds * OFFLINE_CONFIG.EFFICIENCY
    if (amount <= 0) return

    population.value += amount
    if (seconds >= OFFLINE_CONFIG.NOTIFY_MIN_SECONDS) {
      offlineGain.value = { seconds, amount: Math.floor(amount) }
    }
  }

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') flushSave()
  }

  // --- Lifecycle ---

  onMounted(() => {
    loadGame()

    // Tick de production basé sur le temps réel écoulé : les navigateurs
    // ralentissent les timers des onglets en arrière-plan
    let lastTick = Date.now()
    setInterval(() => {
      const now = Date.now()
      const elapsed = Math.min((now - lastTick) / 1000, OFFLINE_CONFIG.MAX_SECONDS)
      lastTick = now
      if (growthRate.value > 0) {
        population.value += growthRate.value * elapsed
      }
    }, 1000)

    // Tick de combo (décroissance)
    setInterval(() => {
      if (comboProgress.value > 0 || comboMultiplier.value > 1.0) {
        // Drain constant du combo quand on ne clique pas ou peu
        comboProgress.value -= decayRate.value

        if (comboProgress.value <= 0) {
          if (comboMultiplier.value > 1.0) {
            comboMultiplier.value -= COMBO_CONFIG.INCREMENT_STEP
            // On peut descendre en cascade
            comboProgress.value += 100
          } else {
            comboProgress.value = 0
          }
        }
      }
    }, COMBO_CONFIG.DECAY_INTERVAL)

    // Auto-save périodique
    setInterval(saveGame, SAVE_CONFIG.AUTOSAVE_INTERVAL)

    // Sauvegarde quand l'onglet est masqué (changement d'onglet, fermeture, mobile en veille)
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange)
  })

  return {
    population,
    growthRate,
    clickPower,
    comboMultiplier,
    comboProgress,
    maxMultiplier,
    cityRank,
    upgradesList,
    upgradeCounts,
    acquiredBonuses,
    offlineGain,
    buildHouse,
    buyUpgrade,
    buyBonus,
    resetGame,
    loadGame,
    saveGame
  }
}
