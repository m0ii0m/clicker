import { ref, watch } from 'vue'

const SPRITE_MAP = {
  'zone': '/assets/sprite_zone-removebg-preview.png',
  'usine': '/assets/sprite_usine-removebg-preview.png',
  'banque': '/assets/sprite_banque-removebg-preview.png',
  'centre_commercial': '/assets/sprite_mall-removebg-preview.png',
  'laboratoire': '/assets/sprite_lab-removebg-preview.png'
}

const GRID_SIZE = 100

function createEmptyGrid() {
  const grid = []
  for (let i = 0; i < GRID_SIZE; i++) {
    grid.push({ id: i, isEmpty: true, spriteUrl: null })
  }
  return grid
}

export function useCityVisuals(upgradeCounts) {
  const grid = ref(createEmptyGrid())

  watch(upgradeCounts, (newCounts) => {
    if (!newCounts || Object.keys(newCounts).length === 0) {
      grid.value = createEmptyGrid()
      return
    }

    // Parcourir chaque type de bâtiment acheté
    for (const [upgradeId, count] of Object.entries(newCounts)) {
      const spriteUrl = SPRITE_MAP[upgradeId]
      if (!spriteUrl) continue

      const currentOfThisType = grid.value.filter(c => c.spriteUrl === spriteUrl).length

      // S'il en manque sur la grille, on les ajoute dans des cellules vides aléatoires
      if (count > currentOfThisType) {
        const toAdd = count - currentOfThisType
        for (let k = 0; k < toAdd; k++) {
          const emptyCells = grid.value.filter(c => c.isEmpty)
          if (emptyCells.length > 0) {
            const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
            cell.isEmpty = false
            cell.spriteUrl = spriteUrl
          }
        }
      }
    }
  }, { deep: true, immediate: true })

  return { grid }
}
