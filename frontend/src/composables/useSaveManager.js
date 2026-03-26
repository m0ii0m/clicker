export function useSaveManager(population, growthRate, upgradeCounts, saveGame) {
  const SECRET_SALT = import.meta.env.VITE_SECRET_SALT || "sel_par_defaut"

  const generateHash = (str) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit int
    }
    return hash.toString(16)
  }

  const exportSave = () => {
    const saveData = {
      trombones: population.value,
      production_rate: growthRate.value,
      upgrades: upgradeCounts.value,
      exportDate: new Date().toISOString()
    }
    const rawJson = JSON.stringify(saveData)

    // Anti-triche : encodage Base64 et signature
    const encodedData = btoa(unescape(encodeURIComponent(rawJson)))
    const hash = generateHash(rawJson + SECRET_SALT)

    const finalExport = {
      _data: encodedData,
      _signature: hash
    }

    const json = JSON.stringify(finalExport, null, 2)
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
        const fileContent = JSON.parse(e.target.result)
        let rawJson = ""

        if (fileContent._data && fileContent._signature) {
          // Version sécurisée (Anti-triche)
          try {
            rawJson = decodeURIComponent(escape(atob(fileContent._data)))
          } catch (err) {
            alert('Fichier de sauvegarde corrompu.')
            return
          }

          const expectedHash = generateHash(rawJson + SECRET_SALT)
          if (expectedHash !== fileContent._signature) {
            alert('🛑 TRICHE DÉTECTÉE ! Le fichier de sauvegarde a été falsifié.')
            return
          }
        } else {
          // Rétrocompatibilité avec les anciennes sauvegardes en texte clair
          rawJson = e.target.result
        }

        const data = JSON.parse(rawJson)
        if (data.trombones === undefined || data.production_rate === undefined) {
          alert('Fichier de sauvegarde invalide.')
          return
        }
        population.value = data.trombones
        growthRate.value = data.production_rate

        // Restaurer les upgrades si présents
        if (data.upgrades) {
          // Vider l'objet existant avant de copier les nouveaux pour éviter la fusion des propriétés supprimées
          for (let key in upgradeCounts.value) delete upgradeCounts.value[key]
          Object.assign(upgradeCounts.value, data.upgrades)
        }
        await saveGame()
        alert('Sauvegarde importée avec succès !')
      } catch (err) {
        console.error(err)
        alert('Erreur lors de la lecture du fichier.')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  return { exportSave, importSave }
}
