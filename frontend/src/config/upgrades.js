export const UPGRADES = [
  {
    id: 'zone',
    name: 'Zone Résidentielle',
    emoji: '🏠',
    baseCost: 50,
    costMultiplier: 1.5,
    rateBonus: 1
  },
  {
    id: 'usine',
    name: 'Usine',
    emoji: '🏭',
    baseCost: 200,
    costMultiplier: 1.6,
    rateBonus: 5
  },
  {
    id: 'banque',
    name: 'Banque',
    emoji: '🏦',
    baseCost: 1000,
    costMultiplier: 1.7,
    rateBonus: 20
  },
  {
    id: 'centre_commercial',
    name: 'Centre Commercial',
    emoji: '🏬',
    baseCost: 5000,
    costMultiplier: 1.8,
    rateBonus: 100
  },
  {
    id: 'laboratoire',
    name: 'Laboratoire',
    emoji: '🔬',
    baseCost: 25000,
    costMultiplier: 2.0,
    rateBonus: 500
  }
]

/**
 * Calcule le coût actuel d'un upgrade en fonction du nombre déjà acheté.
 */
export function getUpgradeCost(upgrade, count) {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, count))
}
