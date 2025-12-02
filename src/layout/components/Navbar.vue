<template>
  <div class="navbar">
    <!-- 菜单展开收起按钮 -->
    <hamburger
      id="hamburger-container"
      :is-active="appStore.sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />
    <!-- 面包屑组件 -->
    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />
    <!-- 右侧内容组件 -->
    <div class="right-menu">
      <!-- 搜索组件 -->
      <header-search id="header-search" class="right-menu-item" />
      <!-- 用户信息 -->
      <user-info></user-info>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store/modules/app'
import Hamburger from '@/components/Hamburger/index.vue'
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import HeaderSearch from '@/components/HeaderSearch/index.vue'
import UserInfo from '@/components/UserInfo/index.vue'
const appStore = useAppStore()

const toggleSideBar = () => {
  appStore.toggleSideBar()
}
</script>

<style scoped lang="scss">
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    display: flex;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 40px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        i {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
