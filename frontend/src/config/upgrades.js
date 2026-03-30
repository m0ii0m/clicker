export const UPGRADES = [
  // --- UPGRADES PASSIFS (Bâtiments) ---
  {
    id: 'zone',
    name: 'Zone Résidentielle',
    emoji: '🏠',
    type: 'passive',
    baseCost: 50,
    costMultiplier: 1.5,
    rateBonus: 1
  },
  {
    id: 'usine',
    name: 'Usine',
    emoji: '🏭',
    type: 'passive',
    baseCost: 200,
    costMultiplier: 1.6,
    rateBonus: 5
  },
  {
    id: 'banque',
    name: 'Banque',
    emoji: '🏦',
    type: 'passive',
    baseCost: 1000,
    costMultiplier: 1.7,
    rateBonus: 20
  },
  {
    id: 'centre_commercial',
    name: 'Centre Commercial',
    emoji: '🏬',
    type: 'passive',
    baseCost: 5000,
    costMultiplier: 1.8,
    rateBonus: 100
  },
  {
    id: 'laboratoire',
    name: 'Laboratoire',
    emoji: '🔬',
    type: 'passive',
    baseCost: 25000,
    costMultiplier: 2.0,
    rateBonus: 500
  },

  // --- UPGRADES DE CLIC (Outils) ---
  {
    id: 'outil_base',
    name: 'Outils de base',
    emoji: '🔨',
    type: 'click',
    baseCost: 100,
    costMultiplier: 1.5,
    clickBonus: 1
  },
  {
    id: 'echafaudage',
    name: 'Echafaudages',
    emoji: '🪜',
    type: 'click',
    baseCost: 1500,
    costMultiplier: 1.6,
    clickBonus: 5
  },
  {
    id: 'grue',
    name: 'Grue de chantier',
    emoji: '🏗️',
    type: 'click',
    baseCost: 10000,
    costMultiplier: 1.8,
    clickBonus: 20
  }
]

/**
 * Calcule le coût actuel d'un upgrade en fonction du nombre déjà acheté.
 */
export function getUpgradeCost(upgrade, count) {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, count))
}
