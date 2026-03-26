import { ref, watch } from 'vue'

const AVAILABLE_SPRITES = [
  'building_medium_blue_a.png',
  'building_medium_blue_b.png',
  'building_medium_green_a.png',
  'building_medium_green_b.png',
  'building_medium_white_a.png',
  'building_medium_white_b.png',
  'building_tall_blue_a.png',
  'building_tall_blue_b.png',
  'building_tall_yellow_a.png',
  'building_tall_yellow_b.png'
]

const GRID_SIZE = 100

function getRandomSpriteUrl() {
  const index = Math.floor(Math.random() * AVAILABLE_SPRITES.length)
  return `./assets/${AVAILABLE_SPRITES[index]}`
}

function createEmptyGrid() {
  const grid = []
  for (let i = 0; i < GRID_SIZE; i++) {
    grid.push({ id: i, isEmpty: true, spriteUrl: null })
  }
  return grid
}

export function useCityVisuals(population) {
  const grid = ref(createEmptyGrid())

  watch(population, (newPop) => {
    if (newPop === 0) {
      grid.value = createEmptyGrid()
      return
    }

    const targetBuildings = Math.min(GRID_SIZE, Math.floor(newPop / 50))
    const currentBuildings = grid.value.filter(c => !c.isEmpty).length

    if (targetBuildings > currentBuildings) {
      const toAdd = targetBuildings - currentBuildings
      for (let k = 0; k < toAdd; k++) {
        const emptyCells = grid.value.filter(c => c.isEmpty)
        if (emptyCells.length > 0) {
          const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
          cell.isEmpty = false
          cell.spriteUrl = getRandomSpriteUrl()
        }
      }
    }
  })

  return { grid }
}
