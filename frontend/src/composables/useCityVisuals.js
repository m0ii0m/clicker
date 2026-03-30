import { ref, watch } from 'vue'
import { UPGRADES } from '../config/upgrades'

const SPRITE_MAP = {
  'zone': '/assets/sprite_zone-removebg-preview.png',
  'usine': '/assets/sprite_usine-removebg-preview.png',
  'banque': '/assets/sprite_banque-removebg-preview.png',
  'centre_commercial': '/assets/sprite_mall-removebg-preview.png',
  'laboratoire': '/assets/sprite_lab-removebg-preview.png'
}

export function useCityVisuals(upgradeCounts) {
  const zones = ref([])

  watch(upgradeCounts, (newCounts) => {
    if (!newCounts || Object.keys(newCounts).length === 0) {
      zones.value = []
      return
    }

    // Générer les zones à partir des upgrades qui ont un sprite et un count > 0
    zones.value = UPGRADES
      .filter(upgrade => SPRITE_MAP[upgrade.id] && (newCounts[upgrade.id] || 0) > 0)
      .map(upgrade => {
        const count = newCounts[upgrade.id] || 0
        const spriteUrl = SPRITE_MAP[upgrade.id]
        const rateTotal = count * (upgrade.rateBonus || 0)
        const cells = []

        for (let i = 0; i < count; i++) {
          cells.push({ id: `${upgrade.id}-${i}`, spriteUrl })
        }

        return {
          id: upgrade.id,
          label: upgrade.name,
          emoji: upgrade.emoji,
          count,
          rateTotal,
          cells
        }
      })
  }, { deep: true, immediate: true })

  return { zones }
}
