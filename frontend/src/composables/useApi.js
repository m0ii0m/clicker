import { ref } from 'vue'

const API_BASE = '/api'

// Identifiant utilisateur persistant
const userId = ref(localStorage.getItem('pixel_city_user_id'))

if (!userId.value) {
  userId.value = 'user_' + Math.random().toString(36).substr(2, 9)
  localStorage.setItem('pixel_city_user_id', userId.value)
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-User-ID': userId.value
  }
}

export function useApi() {
  const fetchState = async () => {
    const response = await fetch(`${API_BASE}/state`, {
      method: 'GET',
      headers: getHeaders()
    })
    if (!response.ok) throw new Error('Erreur API')
    return response.json()
  }

  const saveState = async (state) => {
    await fetch(`${API_BASE}/save`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(state)
    })
  }

  const resetState = async () => {
    const response = await fetch(`${API_BASE}/reset`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    return response.json()
  }

  const copyDebugId = () => {
    navigator.clipboard.writeText(userId.value)
    alert('ID copié : ' + userId.value)
  }

  return {
    userId,
    fetchState,
    saveState,
    resetState,
    copyDebugId
  }
}
