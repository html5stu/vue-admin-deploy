<template>
  <div>
    <div class="flex items-center gap-4">
      <span>{{ userStore.userInfo.username }}</span>
      <button class="text-sm text-red-500" @click="userStore.logout">
        退出
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
</script>

<style scoped lang="scss"></style>
