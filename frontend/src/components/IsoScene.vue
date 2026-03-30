<template>
  <div class="iso-scene">
    <div v-if="zones.length === 0" class="empty-city">
      <span class="empty-icon">🏗️</span>
      <span class="empty-text">Construisez votre ville !</span>
    </div>

    <div
      v-for="zone in zones"
      :key="zone.id"
      class="zone-group"
    >
      <div class="zone-label">
        <span class="zone-emoji">{{ zone.emoji }}</span>
        <span class="zone-name">{{ zone.label }}</span>
        <span class="zone-count">×{{ zone.count }}</span>
      </div>

      <div class="zone-grid">
        <div
          v-for="cell in zone.cells"
          :key="cell.id"
          class="iso-cell"
        >
          <div class="ground-plate"></div>
          <img
            :src="cell.spriteUrl"
            class="building-sprite"
            alt="batiment"
            @error="handleImgError"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  zones: {
    type: Array,
    required: true
  }
})

const handleImgError = (e) => {
  console.error('Erreur chargement image :', e.target.src)
  if (e.target.src !== 'https://placehold.co/64x64/red/white.png?text=404') {
    e.target.src = 'https://placehold.co/64x64/red/white.png?text=404'
  }
}
</script>
