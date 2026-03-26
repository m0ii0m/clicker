<template>
  <div class="footer-actions">
    <button @click="$emit('refresh')" class="link-action">🔄 REFRESH</button>

    <div class="save-actions">
      <button @click="$emit('export')" class="btn-save">📥 EXPORT</button>
      <button @click="triggerImport" class="btn-save">📤 IMPORT</button>
      <input
        type="file"
        ref="importInput"
        accept=".json"
        @change="$emit('import', $event)"
        style="display:none"
      />
    </div>

    <button @click="$emit('reset')" class="link-danger">⚠ RESET BDD</button>

    <div class="debug-info">
      ID: {{ userId.substring(0, 8) }}...
      <button @click="$emit('copyId')" title="Copier ID">📋</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  userId: {
    type: String,
    required: true
  }
})

defineEmits(['refresh', 'export', 'import', 'reset', 'copyId'])

const importInput = ref(null)

const triggerImport = () => {
  importInput.value.click()
}
</script>
