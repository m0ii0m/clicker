import { ref, watch } from 'vue'
import { UPGRADES } from '../config/upgrades'
import { BONUSES } from '../config/bonuses'
import { VISUAL_CONFIG } from '../config/gameConfig'

const SPRITE_MAP = {
  'zone': '/assets/sprite_zone-removebg-preview.png',
  'usine': '/assets/sprite_usine-removebg-preview.png',
  'banque': '/assets/sprite_banque-removebg-preview.png',
  'centre_commercial': '/assets/sprite_mall-removebg-preview.png',
  'laboratoire': '/assets/sprite_lab-removebg-preview.png'
}

export function useCityVisuals(upgradeCounts, acquiredBonuses) {
  const zones = ref([])

  watch([upgradeCounts, acquiredBonuses], ([newCounts, newBonuses]) => {
    if (!newCounts || Object.keys(newCounts).length === 0) {
      zones.value = []
      return
    }
    
    // Fallback if acquiredBonuses is undefined
    const bonuses = newBonuses || []

    // Générer les zones à partir des upgrades qui ont un sprite et un count > 0
    zones.value = UPGRADES
      .filter(upgrade => SPRITE_MAP[upgrade.id] && (newCounts[upgrade.id] || 0) > 0)
      .map(upgrade => {
        const count = newCounts[upgrade.id] || 0
        const spriteUrl = SPRITE_MAP[upgrade.id]
        
        // Appliquer les multiplicateurs de zone
        let mult = 1
        BONUSES.filter(b => b.type === 'zone_multiplier' && b.target === upgrade.id && bonuses.includes(b.id))
               .forEach(b => mult *= b.value)
               
        const rateTotal = count * (upgrade.rateBonus || 0) * mult
        const cells = []

        // Au-delà d'un certain nombre, on n'affiche plus de sprites supplémentaires
        // (le total reste visible dans le label de la zone)
        const visibleCount = Math.min(count, VISUAL_CONFIG.MAX_SPRITES_PER_ZONE)
        for (let i = 0; i < visibleCount; i++) {
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
