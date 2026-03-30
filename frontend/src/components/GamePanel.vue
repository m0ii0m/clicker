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
        <span>FLUX</span>
        <span class="val orange">+{{ growthRate }}/s</span>
      </div>
    </div>

    <div class="action-section">
      <button @click="handleBuildClick" class="btn-main" style="position: relative; overflow: visible;">
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
      <h3>URBANISME</h3>
      <UpgradeCard
        v-for="upgrade in upgradesList"
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
import { ref } from 'vue'
import UpgradeCard from './UpgradeCard.vue'
import FooterActions from './FooterActions.vue'

const props = defineProps({
  population: { type: Number, required: true },
  growthRate: { type: Number, required: true },
  cityRank: { type: String, required: true },
  upgradesList: { type: Array, required: true },
  userId: { type: String, required: true },
  clickPower: { type: Number, required: true }
})

const emit = defineEmits(['build', 'buyUpgrade', 'refresh', 'export', 'import', 'reset', 'copyId'])

const floatingClicks = ref([])
let clickIdCounter = 0

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
