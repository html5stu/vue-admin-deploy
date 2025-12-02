<script setup lang="ts">
import { onMounted, nextTick } from 'vue'
import { useSettingsStore } from '@/store/modules/settings'
import { handleThemeStyle } from '@/utils/theme.js'
const settingsStore = useSettingsStore()

onMounted(() => {
  nextTick(() => {
    handleThemeStyle(settingsStore.theme)
  })
})
</script>

<template>
  <router-view></router-view>
</template>

<style scoped></style>
