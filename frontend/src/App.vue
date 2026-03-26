<script setup>
import { ref, onMounted, computed, watch } from 'vue'

// ==========================================
// 1. MODULE LOGIQUE : ÉTAT DU JEU
// ==========================================
function useGameState() {
  const population = ref(0)
  const growthRate = ref(0)
  const clickPower = ref(1)
  const buildingCost = ref(50)
  
  const userId = ref(localStorage.getItem('pixel_city_user_id'))

  if (!userId.value) {
    userId.value = 'user_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('pixel_city_user_id', userId.value)
  }

  const cityRank = computed(() => {
    if (population.value < 50) return "Campement"
    if (population.value < 500) return "Village"
    if (population.value < 2000) return "Bourgade"
    if (population.value < 10000) return "Ville"
    return "Métropole"
  })

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'X-User-ID': userId.value
  })

  const copyDebugId = () => {
    navigator.clipboard.writeText(userId.value)
    alert("ID copié : " + userId.value)
  }

  const loadGame = async () => {
    try {
      const response = await fetch('/api/state', {
        method: 'GET',
        headers: getHeaders()
      }) 
      
      if (!response.ok) throw new Error("Erreur API")

      const data = await response.json()
      if (data) {
        population.value = data.trombones || 0
        growthRate.value = data.production_rate || 0
        if (growthRate.value > 0) {
           buildingCost.value = Math.floor(50 * Math.pow(1.5, growthRate.value))
        }
      }
      console.log("Jeu rechargé depuis le serveur !")
    } catch (e) { console.error("Erreur Load", e) }
  }

  const saveGame = async () => {
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          trombones: population.value, 
          production_rate: growthRate.value 
        })
      })
    } catch (e) { console.error("Erreur Save", e) }
  }

  const resetGame = async () => {
    if (!confirm("ATTENTION : Cela va effacer définitivement votre ville dans la base de données. Continuer ?")) return
    try {
      await fetch('/api/reset', { 
        method: 'DELETE',
        headers: getHeaders()
      })
      // Reset local
      population.value = 0
      growthRate.value = 0
      buildingCost.value = 50
    } catch (e) { console.error("Erreur Reset", e) }
  }

  const buildHouse = () => {
    population.value += clickPower.value
    saveGame()
  }

  const zoneDistrict = () => {
    if (population.value >= buildingCost.value) {
      population.value -= buildingCost.value
      growthRate.value += 1
      buildingCost.value = Math.floor(buildingCost.value * 1.5)
      saveGame()
    }
  }

  const exportSave = () => {
    console.log("Export appelé")
    const saveData = {
      trombones: population.value,
      production_rate: growthRate.value,
      userId: userId.value,
      exportDate: new Date().toISOString()
    }
    const json = JSON.stringify(saveData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pixel_city_save.json'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
  }

  const importSave = (event) => {
    const file = event.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (data.trombones === undefined || data.production_rate === undefined) {
          alert('Fichier de sauvegarde invalide.')
          return
        }
        population.value = data.trombones
        growthRate.value = data.production_rate
        buildingCost.value = Math.floor(50 * Math.pow(1.5, growthRate.value))
        await saveGame()
        alert('Sauvegarde importée avec succès !')
      } catch (err) {
        alert('Erreur lors de la lecture du fichier.')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  onMounted(() => {
    loadGame()
    setInterval(() => {
      if (growthRate.value > 0) population.value += growthRate.value
    }, 1000)
    setInterval(saveGame, 10000)
  })

  return {
    population,
    growthRate,
    buildingCost,
    cityRank,
    buildHouse,
    zoneDistrict,
    resetGame,
    loadGame,
    userId,
    copyDebugId,
    exportSave,
    importSave
  }
}

// ==========================================
// 2. MODULE VISUEL : CHARGEMENT DES SPRITES
// ==========================================
function useCityVisuals(population) {
  const gridSize = 100
  const grid = ref([])

  // --- CONFIGURATION DES ASSETS ---
  const availableSprites = [
    'building_medium_blue_a.png',
    'building_medium_blue_b.png',
    'building_medium_green_a.png',
    'building_medium_green_b.png',
    'building_medium_white_a.png',
    'building_medium_white_b.png',
    'building_tall_blue_a.png',
    'building_tall_blue_b.png',
    'building_tall_yellow_a.png',
    'building_tall_yellow_b.png',
    'building_medium_blue_a_damaged.png',
    'building_medium_blue_b_damaged.png',
    'building_medium_green_a_damaged.png',
    'building_medium_green_b_damaged.png',
    'building_medium_white_a_damaged.png',
    'building_medium_white_b_damaged.png',
    'building_tall_blue_a_damaged.png',
    'building_tall_blue_b_damaged.png',
    'building_tall_yellow_a_damaged.png',
    'building_tall_yellow_b_damaged.png'
  ]

  const getRandomSpriteUrl = () => {
    const candidates = availableSprites.filter(name => 
      name.startsWith('building_') && !name.includes('_damaged')
    )
    
    if (candidates.length === 0) return 'https://placehold.co/64x64/red/white.png?text=NO_ASSET'

    const randomIndex = Math.floor(Math.random() * candidates.length)
    const filename = candidates[randomIndex]
    
    return `./assets/${filename}`
  }

  const initGrid = () => {
    const newGrid = []
    for (let i = 0; i < gridSize; i++) {
      newGrid.push({
        id: i,
        isEmpty: true,
        spriteUrl: null
      })
    }
    grid.value = newGrid
  }

  initGrid()

  watch(population, (newPop) => {
    if (newPop === 0) {
      initGrid()
      return
    }

    const targetBuildings = Math.min(gridSize, Math.floor(newPop / 50))
    const currentBuildings = grid.value.filter(c => !c.isEmpty).length

    if (targetBuildings > currentBuildings) {
      const buildingsToAdd = targetBuildings - currentBuildings
      for(let k=0; k < buildingsToAdd; k++) {
        const emptyCells = grid.value.filter(c => c.isEmpty)
        if (emptyCells.length > 0) {
          const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
          
          randomCell.isEmpty = false
          randomCell.spriteUrl = getRandomSpriteUrl()
        }
      }
    }
  })

  return { grid }
}

// ==========================================
// 3. SETUP PRINCIPAL
// ==========================================
const { population, growthRate, buildingCost, cityRank, buildHouse, zoneDistrict, resetGame, loadGame, userId, copyDebugId, exportSave, importSave } = useGameState()
const { grid } = useCityVisuals(population)

const handleImgError = (e) => {
  console.error("Erreur chargement image :", e.target.src)
  if (e.target.src !== "https://placehold.co/64x64/red/white.png?text=404") {
    e.target.src = "https://placehold.co/64x64/red/white.png?text=404"
  }
}
</script>

<template>
  <div class="main-wrapper">
    
    <!-- COUCHE 1 : SCÈNE ISOMÉTRIQUE -->
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

    <!-- COUCHE 2 : INTERFACE (Gauche) -->
    <div class="game-ui-panel">
      <h1 class="pixel-title">PIXEL CITY</h1>
      <div class="rank-badge">{{ cityRank }}</div>
      
      <div class="stats-box">
        <div class="stat-line">
          <span>POPULATION</span>
          <span class="val green">{{ population.toFixed(0) }}</span>
        </div>
        <div class="stat-line">
          <span>FLUX</span>
          <span class="val orange">+{{ growthRate }}/s</span>
        </div>
      </div>

      <div class="action-section">
        <button @click="buildHouse" class="btn-main">
          🏠 CONSTRUIRE
        </button>
      </div>

      <div class="upgrade-section">
        <h3>URBANISME</h3>
        <div class="upgrade-card">
          <div class="info">
            <span>Zone Résidentielle</span>
            <small>Coût: {{ buildingCost }}</small>
          </div>
          <button 
            @click="zoneDistrict" 
            class="btn-mini" 
            :disabled="population < buildingCost">
            ACHETER
          </button>
        </div>
      </div>

      <!-- Actions de gestion -->
      <div class="footer-actions">
        <!-- Bouton Reload sans recharger la page -->
        <button @click="loadGame" class="link-action">🔄 REFRESH</button>

        <!-- Export / Import -->
        <div class="save-actions">
          <button @click="exportSave" class="btn-save">📥 EXPORT</button>
          <button @click="$refs.importInput.click()" class="btn-save">📤 IMPORT</button>
          <input type="file" ref="importInput" accept=".json" @change="importSave" style="display:none" />
        </div>
        
        <!-- Bouton Reset BDD -->
        <button @click="resetGame" class="link-danger">⚠ RESET BDD</button>
        
        <div class="debug-info">
          ID: {{ userId.substring(0, 8) }}...
          <button @click="copyDebugId" title="Copier ID">📋</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

body {
  margin: 0;
  overflow: hidden;
  background: #1e1e2e;
  font-family: 'Press Start 2P', cursive;
  color: #fff;
}

.main-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, #2c3e50 0%, #111 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* --- SCÈNE ISOMÉTRIQUE --- */
.iso-scene {
  width: 600px;
  height: 600px;
  transform: rotateX(60deg) rotateZ(45deg);
  transform-style: preserve-3d;
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -300px;
  margin-left: -200px;
  z-index: 1;
}

.iso-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(10, 1fr);
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 4px solid #34495e;
  transform-style: preserve-3d;
}

.iso-cell {
  position: relative;
  width: 100%;
  height: 100%;
  border: 1px solid rgba(255,255,255,0.05);
  transform-style: preserve-3d;
}

.ground-plate {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #27ae60;
  opacity: 0.8;
  transform: translateZ(0);
  transition: background 0.2s;
}

.iso-cell:hover .ground-plate {
  background: #2ecc71;
  cursor: crosshair;
}

/* --- SPRITE DYNAMIQUE (OFFSET CORRIGÉ) --- */
.building-sprite {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 64px; 
  height: auto;
  
  /* OFFSET AJUSTÉ :
     -65% en X (plus vers la gauche)
     -60% en Y (plus vers le bas / "devant")
     rotateZ/X pour redresser face caméra
     translateZ(5px) pour éviter le clipping sol
  */
  transform: translate(-65%, -60%) rotateZ(-45deg) rotateX(-60deg) translateZ(5px);
  
  transform-origin: bottom center;
  image-rendering: pixelated;
  pointer-events: none;
  filter: drop-shadow(5px 5px 5px rgba(0,0,0,0.5));
}

/* --- INTERFACE UTILISATEUR (UI) --- */
.game-ui-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 300px;
  height: 100vh;
  background: rgba(10, 10, 15, 0.95);
  border-right: 4px solid #000;
  padding: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  box-shadow: 10px 0 30px rgba(0,0,0,0.5);
}

.pixel-title {
  color: #f1c40f;
  text-shadow: 3px 3px 0 #000;
  font-size: 24px;
  margin: 20px 0 10px 0;
  text-align: center;
}

.rank-badge {
  background: #34495e;
  color: #3498db;
  text-align: center;
  padding: 5px;
  font-size: 10px;
  margin-bottom: 30px;
  border: 2px solid #000;
}

.stats-box {
  background: #2c3e50;
  border: 4px solid #000;
  padding: 15px;
  margin-bottom: 30px;
}

.stat-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 12px;
}
.stat-line:last-child { margin-bottom: 0; }

.val.green { color: #2ecc71; }
.val.orange { color: #e67e22; }

.action-section {
  margin-bottom: 30px;
}

.btn-main {
  width: 100%;
  padding: 20px;
  background: #e74c3c;
  color: white;
  border: 4px solid #000;
  box-shadow: 4px 4px 0 #000;
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
}
.btn-main:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0 #000; }

.upgrade-section h3 {
  font-size: 14px;
  color: #bdc3c7;
  border-bottom: 2px solid #333;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.upgrade-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255,255,255,0.05);
  padding: 10px;
  border: 2px solid #000;
}

.info { display: flex; flex-direction: column; }
.info span { font-size: 10px; margin-bottom: 5px; }
.info small { font-size: 8px; color: #7f8c8d; }

.btn-mini {
  background: #3498db;
  color: white;
  border: 2px solid #000;
  padding: 8px 5px;
  font-size: 8px;
  font-family: inherit;
  cursor: pointer;
}
.btn-mini:disabled { background: #555; cursor: not-allowed; }

.footer-actions {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  font-size: 10px;
  padding-top: 20px;
  border-top: 2px dashed #333;
}

.link-danger {
  background: #c0392b;
  border: 2px solid #000;
  color: #fff;
  padding: 8px;
  font-family: inherit;
  cursor: pointer;
  font-size: 10px;
  width: 100%;
}
.link-danger:hover { background: #e74c3c; }

.link-action {
  background: #27ae60;
  border: 2px solid #000;
  color: #fff;
  padding: 8px;
  font-family: inherit;
  cursor: pointer;
  font-size: 10px;
  width: 100%;
}
.link-action:hover { background: #2ecc71; }

.save-actions {
  display: flex;
  gap: 10px;
  width: 100%;
}

.btn-save {
  flex: 1;
  background: #2980b9;
  border: 2px solid #000;
  color: #fff;
  padding: 8px;
  font-family: inherit;
  cursor: pointer;
  font-size: 10px;
}
.btn-save:hover { background: #3498db; }

.debug-info {
  color: #555;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
}
.debug-info button {
  background: none;
  border: 1px solid #555;
  color: #555;
  cursor: pointer;
  padding: 2px;
}
</style>