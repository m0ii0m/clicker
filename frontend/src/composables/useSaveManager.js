export function useSaveManager(population, growthRate, upgradeCounts, saveGame) {
  const exportSave = () => {
    const saveData = {
      trombones: population.value,
      production_rate: growthRate.value,
      upgrades: upgradeCounts,
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
        // Restaurer les upgrades si présents
        if (data.upgrades) {
          Object.assign(upgradeCounts, data.upgrades)
        }
        await saveGame()
        alert('Sauvegarde importée avec succès !')
      } catch (err) {
        alert('Erreur lors de la lecture du fichier.')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  return { exportSave, importSave }
}
