<template>
  <div class="sidebar-logo-container">
    <router-link
      v-if="collapse"
      key="collapse"
      class="sidebar-logo-link"
      to="/"
    >
      <img v-if="logo" :src="logo" class="sidebar-logo" />
      <h1 v-else class="sidebar-title">德易购商家平台</h1>
    </router-link>
    <router-link v-else key="expand" class="sidebar-logo-link" to="/">
      <img v-if="logo" :src="logo" class="sidebar-logo" />
      <h1 class="sidebar-title">德易购商家平台</h1>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import logo from '@/assets/logo/logo.png'
const props = defineProps({
  collapse: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped lang="scss">
.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  background: #2b2f3a;
  text-align: center;
  cursor: pointer;
  .sidebar-logo {
    width: 32px;
    height: 32px;
    vertical-align: middle;
    margin-right: 12px;
  }
  .sidebar-title {
    display: inline-block;
    margin: 0;
    color: #fff;
    font-weight: 600;
    line-height: 50px;
    font-size: 14px;
  }
  .collapse.sidebar-logo {
    margin-right: 0px;
  }
}
</style>
