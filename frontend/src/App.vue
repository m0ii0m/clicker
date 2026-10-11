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
  population, growthRate, cityRank, upgradesList, upgradeCounts, clickPower, acquiredBonuses,
  comboMultiplier, comboProgress, maxMultiplier,
  buildHouse, buyUpgrade, buyBonus, resetGame, loadGame, saveGame
} = useGameState()
const { zones } = useCityVisuals(upgradeCounts, acquiredBonuses)
const { exportSave, importSave } = useSaveManager(population, upgradeCounts, acquiredBonuses, saveGame)
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