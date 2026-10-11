export const COMBO_CONFIG = {
  MAX_MULTIPLIER: 5.0,
  INCREMENT_STEP: 1.0,
  PROGRESS_ON_CLICK: 10, // 10% par clic -> 10 clics pour un palier de 0.5
  DECAY_RATE: 4.0,       // Pourcentage perdu toutes les 100ms (vitesse de descente)
  DECAY_INTERVAL: 100    // Intervalle en ms
}

export const SAVE_CONFIG = {
  AUTOSAVE_INTERVAL: 10000, // Sauvegarde périodique (ms)
  CLICK_SAVE_DELAY: 2000,   // Sauvegarde différée après le dernier clic (ms)
  LOAD_RETRY_DELAY: 5000    // Nouvel essai si le premier chargement échoue (ms)
}

export const OFFLINE_CONFIG = {
  MAX_SECONDS: 8 * 3600,   // Production hors ligne plafonnée à 8h
  EFFICIENCY: 1.0,         // Part de la production conservée hors ligne (1.0 = 100%)
  NOTIFY_MIN_SECONDS: 60   // Pas de message pour une absence plus courte
}

export const VISUAL_CONFIG = {
  MAX_SPRITES_PER_ZONE: 25 // 5 lignes de la grille (5 colonnes)
}
