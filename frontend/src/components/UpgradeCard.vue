<template>
  <div class="upgrade-card">
    <div class="info">
      <span>{{ upgrade.emoji }} {{ upgrade.name }}</span>
      <small>Coût: {{ upgrade.currentCost }} | Possédé: {{ upgrade.count }} | +{{ upgrade.type === 'click' ? upgrade.clickBonus + '/clic' : upgrade.rateBonus + '/s' }}</small>
    </div>
    <button
      class="btn-mini"
      :disabled="!upgrade.canAfford"
      @click="$emit('buy', upgrade.id)"
    >
      ACHETER
    </button>
  </div>
</template>

<script setup>
defineProps({
  upgrade: {
    type: Object,
    required: true
  }
})

defineEmits(['buy'])
</script>
