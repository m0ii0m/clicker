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
  population, growthRate, cityRank, upgradesList, upgradeCounts,
  buildHouse, buyUpgrade, resetGame, loadGame, saveGame
} = useGameState()
const { grid } = useCityVisuals(upgradeCounts)
const { exportSave, importSave } = useSaveManager(population, growthRate, upgradeCounts, saveGame)
</script>

<template>
  <div class="main-wrapper">
    <IsoScene :grid="grid" />
    <GamePanel
      :population="population"
      :growthRate="growthRate"
      :cityRank="cityRank"
      :upgradesList="upgradesList"
      :userId="userId"
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