<template>
  <div class="app-wraper" :class="classObj">
    <Sliderbar class="sidebar-container" />
    <div class="main-container hasTagsView">
      <div>
        <!-- 顶部导航 -->
        <Navbar />
        <!-- tag标签 显示打开的路由 -->
        <tags-view></tags-view>
      </div>
      <AppMain />
    </div>
  </div>
</template>

<script setup lang="ts">
import Sliderbar from './components/Sliderbar/index.vue'
import Navbar from './components/Navbar.vue'
import TagsView from '@/components/TagsView/index.vue'
import AppMain from './components/AppMain.vue'
import { useAppStore } from '@/store/modules/app'
import { useSettingsStore } from '@/store/modules/settings'

const appStore = useAppStore()
const settingsStore = useSettingsStore()

const theme = computed(() => {
  return settingsStore.theme
})

import { ref, computed } from 'vue'

const classObj = computed(() => {
  return {
    openSidebar: appStore.sidebar.opened,
    hideSidebar: !appStore.sidebar.opened,
  }
})
const sidebar = computed(() => {
  return appStore.sidebar
})
</script>

<style scoped lang="scss">
.app-wraper {
  position: relative;
  height: 100%;
  width: 100%;
}
.sidebar-container {
  -webkit-transition: width 0.28s;
  transition: width 0.28s;
  width: $base-sidebar-width !important;
  background-color: $base-menu-background;
  height: 100%;
  position: fixed;
  font-size: 0px;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1001;
  overflow: hidden;
  -webkit-box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
}
.main-container {
  height: 100%;
  margin-left: 200px;
  transition: margin-left 0.28s;
  position: relative;
}
.hideSidebar .sidebar-container {
  width: 54px !important;
}
.hideSidebar .main-container {
  margin-left: 54px;
}
</style>
