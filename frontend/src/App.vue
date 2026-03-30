<script setup>
import { useGameState } from './composables/useGameState'
import { useCityVisuals } from './composables/useCityVisuals'
import { useSaveManager } from './composables/useSaveManager'
import { useApi } from './composables/useApi'
import GamePanel from './components/GamePanel.vue'
import IsoScene from './components/IsoScene.vue'

// Composables
const { userId, copyDebugId } = useApi()
const {
  population, growthRate, cityRank, upgradesList, upgradeCounts, clickPower,
  buildHouse, buyUpgrade, resetGame, loadGame, saveGame
} = useGameState()
const { zones } = useCityVisuals(upgradeCounts)
const { exportSave, importSave } = useSaveManager(population, growthRate, upgradeCounts, saveGame)
</script>

<template>
  <div class="main-wrapper">
    <IsoScene :zones="zones" />
    <GamePanel
      :population="population"
      :growthRate="growthRate"
      :cityRank="cityRank"
      :upgradesList="upgradesList"
      :userId="userId"
      :clickPower="clickPower"
      @build="buildHouse"
      @buyUpgrade="buyUpgrade"
      @refresh="loadGame"
      @export="exportSave"
      @import="importSave"
      @reset="resetGame"
      @copyId="copyDebugId"
    />
  </div>
</template>