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
      <button @click="$emit('build')" class="btn-main">
        🏠 CONSTRUIRE
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
import UpgradeCard from './UpgradeCard.vue'
import FooterActions from './FooterActions.vue'

defineProps({
  population: { type: Number, required: true },
  growthRate: { type: Number, required: true },
  cityRank: { type: String, required: true },
  upgradesList: { type: Array, required: true },
  userId: { type: String, required: true }
})

defineEmits(['build', 'buyUpgrade', 'refresh', 'export', 'import', 'reset', 'copyId'])
</script>
