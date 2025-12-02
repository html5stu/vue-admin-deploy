<template>
  <div :class="classObj">
    <Logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper" :class="sideTheme">
      <el-menu
        router
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="
          settingsStore.sideTheme === 'dark'
            ? variables.menuBackground
            : variables.menuLightBackground
        "
        :text-color="
          settingsStore.sideTheme === 'dark'
            ? variables.menuColor
            : variables.menuLightColor
        "
        :active-text-color="theme"
        :unique-opened="true"
        :collapse-transition="false"
      >
        <template v-for="item in slidebarRouters" :key="item.path">
          <!-- 如果只有一个子菜单，直接显示子菜单 -->
          <el-menu-item
            v-if="item.children && item.children.length === 1"
            :index="item.path + '/' + item.children[0].path"
          >
            <el-icon v-if="item.children[0].meta?.icon">
              <component :is="item.children[0].meta.icon" />
            </el-icon>
            <span>{{ item.children[0].meta.title }}</span>
          </el-menu-item>

          <!-- 如果有多个子菜单，显示下拉菜单 -->
          <el-sub-menu
            v-else-if="item.children && item.children.length > 1"
            :index="item.path"
          >
            <template #title>
              <el-icon v-if="item.meta?.icon">
                <component :is="item.meta.icon" />
              </el-icon>
              <span>{{ item.meta.title }}</span>
            </template>
            <el-menu-item
              v-for="subItem in item.children"
              :key="subItem.path"
              :index="item.path + '/' + subItem.path"
            >
              <el-icon v-if="subItem.meta?.icon">
                <component :is="subItem.meta.icon" />
              </el-icon>
              <span>{{ subItem.meta.title }}</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 如果没有子菜单，直接显示当前菜单 -->
          <el-menu-item v-else :index="item.path">
            <el-icon v-if="item.meta?.icon">
              <component :is="item.meta.icon" />
            </el-icon>
            <span>{{ item.meta.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Logo from './Logo.vue'
import { useRoute } from 'vue-router'
import variables from '@/assets/styles/var.module.scss'
const route = useRoute()

import { useSettingsStore } from '@/store/modules/settings'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'
const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()
const sideTheme = computed(() => settingsStore.sideTheme)
const theme = computed(() => settingsStore.theme)
const showLogo = computed(() => settingsStore.showLogo)
const isCollapse = computed(() => !appStore.sidebar.opened)
const classObj = computed(() => ({
  dark: sideTheme.value === 'dark',
  light: sideTheme.value === 'light',
  'has-logo': settingsStore.showLogo,
}))

const slidebarRouters = computed(() =>
  permissionStore.sidebarRouters.filter((item) => {
    return !item.hidden
  })
)

console.log('slidebarRouters', slidebarRouters.value)

// 激活菜单
const activeMenu = computed(() => {
  const { path } = route
  return path
})
</script>

<style scoped lang="scss">
#app {
  .main-container {
    height: 100%;
    transition: margin-left 0.28s;
    margin-left: $base-sidebar-width;
    position: relative;
  }

  .sidebarHide {
    margin-left: 0 !important;
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

    // reset element-ui css
    .horizontal-collapse-transition {
      transition:
        0s width ease-in-out,
        0s padding-left ease-in-out,
        0s padding-right ease-in-out;
    }

    .scrollbar-wrapper {
      overflow-x: hidden !important;
    }

    .el-scrollbar__bar.is-vertical {
      right: 0px;
    }

    .el-scrollbar {
      height: 100%;
    }

    &.has-logo {
      .el-scrollbar {
        height: calc(100% - 50px);
      }
    }

    .is-horizontal {
      display: none;
    }

    a {
      display: inline-block;
      width: 100%;
      overflow: hidden;
    }

    .svg-icon {
      margin-right: 16px;
    }

    .el-menu {
      border: none;
      height: 100%;
      width: 100% !important;
    }

    .el-menu-item,
    .menu-title {
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }

    .el-menu-item .el-menu-tooltip__trigger {
      display: inline-block !important;
    }

    // menu hover
    .sub-menu-title-noDropdown,
    .el-sub-menu__title {
      &:hover {
        background-color: rgba(0, 0, 0, 0.06) !important;
      }
    }

    & .theme-dark .is-active > .el-sub-menu__title {
      color: $base-menu-color-active !important;
    }

    & .nest-menu .el-sub-menu > .el-sub-menu__title,
    & .el-sub-menu .el-menu-item {
      min-width: $base-sidebar-width !important;

      &:hover {
        background-color: rgba(0, 0, 0, 0.06) !important;
      }
    }

    & .theme-dark .nest-menu .el-sub-menu > .el-sub-menu__title,
    & .theme-dark .el-sub-menu .el-menu-item {
      background-color: $base-sub-menu-background !important;

      &:hover {
        background-color: $base-sub-menu-hover !important;
      }
    }
  }

  .hideSidebar {
    .sidebar-container {
      width: 54px !important;
    }

    .main-container {
      margin-left: 54px;
    }

    .sub-menu-title-noDropdown {
      padding: 0 !important;
      position: relative;

      .el-tooltip {
        padding: 0 !important;

        .svg-icon {
          margin-left: 20px;
        }
      }
    }

    .el-sub-menu {
      overflow: hidden;

      & > .el-sub-menu__title {
        padding: 0 !important;

        .svg-icon {
          margin-left: 20px;
        }
      }
    }

    .el-menu--collapse {
      .el-sub-menu {
        & > .el-sub-menu__title {
          & > span {
            height: 0;
            width: 0;
            overflow: hidden;
            visibility: hidden;
            display: inline-block;
          }
          & > i {
            height: 0;
            width: 0;
            overflow: hidden;
            visibility: hidden;
            display: inline-block;
          }
        }
      }
    }
  }

  .el-menu--collapse .el-menu .el-sub-menu {
    min-width: $base-sidebar-width !important;
  }

  // mobile responsive
  .mobile {
    .main-container {
      margin-left: 0px;
    }

    .sidebar-container {
      transition: transform 0.28s;
      width: $base-sidebar-width !important;
    }

    &.hideSidebar {
      .sidebar-container {
        pointer-events: none;
        transition-duration: 0.3s;
        transform: translate3d(-$base-sidebar-width, 0, 0);
      }
    }
  }

  .withoutAnimation {
    .main-container,
    .sidebar-container {
      transition: none;
    }
  }
}

// when menu collapsed
.el-menu--vertical {
  & > .el-menu {
    .svg-icon {
      margin-right: 16px;
    }
  }

  .nest-menu .el-sub-menu > .el-sub-menu__title,
  .el-menu-item {
    &:hover {
      // you can use $sub-menuHover
      background-color: rgba(0, 0, 0, 0.06) !important;
    }
  }

  // the scroll bar appears when the sub-menu is too long
  > .el-menu--popup {
    max-height: 100vh;
    overflow-y: auto;

    &::-webkit-scrollbar-track-piece {
      background: #d3dce6;
    }

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: #99a9bf;
      border-radius: 20px;
    }
  }
}

.dark {
  background-color: $base-menu-background !important;
}
.light {
  background-color: $base-menu-light-background !important;
}
.scrollbar-wrapper {
  overflow-x: hidden !important;
}
.has-logo {
  .el-scrollbar {
    height: calc(100% - 50px);
  }
}
</style>
