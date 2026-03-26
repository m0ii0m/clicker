<template>
  <div class="iso-scene">
    <div class="iso-grid">
      <div
        v-for="cell in grid"
        :key="cell.id"
        class="iso-cell"
      >
        <div class="ground-plate"></div>
        <img
          v-if="!cell.isEmpty"
          :src="cell.spriteUrl"
          class="building-sprite"
          alt="batiment"
          @error="handleImgError"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  grid: {
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
