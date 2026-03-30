<template>
  <div class="game-ui-panel">
    <h1 class="pixel-title">PIXEL CITY</h1>
    <div class="rank-badge">{{ cityRank }}</div>

    <div class="stats-box">
      <div class="stat-line">
        <span>POPULATION</span>
        <span class="val green">{{ Math.floor(population) }}</span>
      </div>
      <div class="stat-line">
        <span>CLIC</span>
        <span class="val blue">+{{ clickPower }}/clic</span>
      </div>
      <div class="stat-line">
        <span>FLUX</span>
        <span class="val orange">+{{ growthRate }}/s</span>
      </div>
    </div>

    <div class="combo-section" v-if="comboMultiplier >= 1.0">
      <div class="combo-header">
        <span>COMBO</span>
        <span class="combo-mult" :class="{ 'max-combo': comboMultiplier >= config.MAX_MULTIPLIER }">
          x{{ comboMultiplier.toFixed(1) }}
        </span>
      </div>
      <div class="combo-bar-wrapper">
        <div class="combo-bar-fill" :style="{ width: comboProgress + '%' }"></div>
      </div>
    </div>

    <div class="action-section">
      <button 
        @click="handleBuildClick" 
        @keydown.space.prevent 
        @keydown.enter.prevent 
        class="btn-main" 
        style="position: relative; overflow: visible;"
      >
        🏠 CONSTRUIRE
        <div
          v-for="click in floatingClicks"
          :key="click.id"
          class="floating-text"
          :style="{ left: click.x + 'px', top: click.y + 'px' }"
        >
          +{{ clickPower }}
        </div>
      </button>
    </div>

    <div class="upgrade-section">
      <h3>EQUIPEMENT</h3>
      <UpgradeCard
        v-for="upgrade in clickUpgrades"
        :key="upgrade.id"
        :upgrade="upgrade"
        @buy="$emit('buyUpgrade', $event)"
      />
    </div>

    <div class="upgrade-section">
      <h3>AMENAGEMENT</h3>
      <UpgradeCard
        v-for="upgrade in passiveUpgrades"
        :key="upgrade.id"
        :upgrade="upgrade"
        @buy="$emit('buyUpgrade', $event)"
      />
    </div>

    <FooterActions
      :userId="userId"
      @refresh="$emit('refresh')"
      @export="$emit('export')"
      @import="$emit('import', $event)"
      @reset="$emit('reset')"
      @copyId="$emit('copyId')"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import UpgradeCard from './UpgradeCard.vue'
import FooterActions from './FooterActions.vue'
import { COMBO_CONFIG } from '../config/gameConfig'

const props = defineProps({
  population: { type: Number, required: true },
  growthRate: { type: Number, required: true },
  cityRank: { type: String, required: true },
  upgradesList: { type: Array, required: true },
  userId: { type: String, required: true },
  clickPower: { type: Number, required: true },
  comboMultiplier: { type: Number, required: true },
  comboProgress: { type: Number, required: true }
})

const emit = defineEmits(['build', 'buyUpgrade', 'refresh', 'export', 'import', 'reset', 'copyId'])

const floatingClicks = ref([])
let clickIdCounter = 0

const config = COMBO_CONFIG

// Filtrer la vue des améliorations
const passiveUpgrades = computed(() => props.upgradesList.filter(u => u.type === 'passive'))
const clickUpgrades = computed(() => props.upgradesList.filter(u => u.type === 'click'))

const handleBuildClick = (e) => {
  emit('build')
  
  // Calculate relative position based on click target bounding rect
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  const id = clickIdCounter++
  floatingClicks.value.push({ id, x, y })
  
  // Remove after 1 second (matches animation duration)
  setTimeout(() => {
    floatingClicks.value = floatingClicks.value.filter(c => c.id !== id)
  }, 1000)
}
</script>
