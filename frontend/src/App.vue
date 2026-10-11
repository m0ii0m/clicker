<script setup>
import { useGameState } from './composables/useGameState'
import { useCityVisuals } from './composables/useCityVisuals'
import { useSaveManager } from './composables/useSaveManager'
import { useApi } from './composables/useApi'
import GamePanel from './components/GamePanel.vue'
import BonusPanel from './components/BonusPanel.vue'
import IsoScene from './components/IsoScene.vue'

// Composables
const { userId, copyDebugId } = useApi()
const {
  population, growthRate, cityRank, upgradesList, upgradeCounts, clickPower, acquiredBonuses, offlineGain,
  comboMultiplier, comboProgress, maxMultiplier,
  buildHouse, buyUpgrade, buyBonus, resetGame, loadGame, saveGame
} = useGameState()
const { zones } = useCityVisuals(upgradeCounts, acquiredBonuses)
const { exportSave, importSave } = useSaveManager(population, upgradeCounts, acquiredBonuses, saveGame)

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600)
  const min = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${min}min` : `${min}min`
}

const dismissOfflineGain = () => {
  offlineGain.value = null
}
</script>

<template>
  <div class="main-wrapper">
    <div v-if="offlineGain" class="offline-notice" @click="dismissOfflineGain">
      <div>Pendant votre absence ({{ formatDuration(offlineGain.seconds) }})</div>
      <div class="offline-amount">+{{ offlineGain.amount.toLocaleString('fr-FR') }} habitants</div>
      <small>Cliquer pour fermer</small>
    </div>
    <IsoScene :zones="zones" />
    <GamePanel
      :population="population"
      :growthRate="growthRate"
      :cityRank="cityRank"
      :upgradesList="upgradesList"
      :userId="userId"
      :clickPower="clickPower"
      :comboMultiplier="comboMultiplier"
      :comboProgress="comboProgress"
      :maxMultiplier="maxMultiplier"
      @build="buildHouse"
      @buyUpgrade="buyUpgrade"
      @refresh="loadGame"
      @export="exportSave"
      @import="importSave"
      @reset="resetGame"
      @copyId="copyDebugId"
    />
    <BonusPanel
      :population="population"
      :acquiredBonuses="acquiredBonuses"
      @buy="buyBonus"
    />
  </div>
</template>