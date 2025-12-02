<template>
  <div id="tags-view-container" class="tags-view-container">
    <router-link
      v-for="tag in visitedViews"
      :key="tag.path"
      :data-path="tag.path"
      :class="isActive(tag) ? 'active' : ''"
      :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
      class="tags-view-item"
      :style="activeStyle(tag)"
    >
      {{ tag.title }}
      <span v-if="!isAffix(tag)" @click.stop.prevent="closeSelectedTag(tag)">
        <el-icon>
          <Close />
        </el-icon>
      </span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  watch,
  onMounted,
  computed,
  nextTick,
  getCurrentInstance,
} from 'vue'
import { getNormalPath } from '@/utils/tools'

import { useRouter, useRoute } from 'vue-router'

import { usePermissionStore } from '@/store/modules/permission'
import { useTagViewsStore } from '@/store/modules/tagViews'
import { useSettingsStore } from '@/store/modules/settings'
const permissionStore = usePermissionStore()
const tagViewsStore = useTagViewsStore()
const settingsStore = useSettingsStore()
const visitedViews = computed(() => tagViewsStore.visitedViews)
const theme = computed(() => settingsStore.theme)
const router = useRouter()
const route = useRoute()

const routes = computed(() => permissionStore.routes)

const { proxy } = getCurrentInstance() as any

watch(route, () => {
  console.log('route changed', route)
  addTags()
})
onMounted(() => {
  initTags()
  addTags()
})
// 筛选出固定标签，永远显示到tagsView中
const filterAffixTags = (routes: any, basePath = '') => {
  let tags = []
  routes.forEach((route) => {
    if (route.meta && route.meta.affix) {
      const tagPath = getNormalPath(basePath + '/' + route.path)
      console.log('tagpath', tagPath)
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name,
        meta: { ...route.meta },
      })
    }
    if (route.children) {
      const tempTags = filterAffixTags(route.children, route.path)
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags]
      }
    }
  })
  return tags
}
function addTags() {
  const { name } = route
  if (name) {
    tagViewsStore.addView(route)
  }
  console.log('visitedViews', visitedViews.value)
  console.log('cachedViews', tagViewsStore.cachedViews)
  return false
}

// 初始化标签
const initTags = () => {
  const res = filterAffixTags(routes.value)
  for (const tag of res) {
    if (tag.name) {
      tagViewsStore.addVisitedView(tag)
    }
  }
}

function isAffix(tag) {
  return tag.meta && tag.meta.affix
}

function isActive(r) {
  return r.path === route.path
}
// 关闭标签
function closeSelectedTag(view) {
  // proxy.$tab.closePage(view).then(({ visitedViews }) => {
  //   if (isActive(view)) {
  //     toLastView(visitedViews, view)
  //   }
  // })
  tagViewsStore.delView(view)
  if (isActive(view)) {
    toLastView(visitedViews.value, view)
  }
}
// 回到上一个标签
function toLastView(visitedViews, view) {
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    console.log('latestView', latestView)
    router.push(latestView.fullPath)
  } else {
    console.log('无上一个标签')
    // now the default is to redirect to the home page if there is no tags-view,
    // you can adjust it according to your needs.
    if (view.name === 'Dashboard') {
      // to reload home page
      router.replace({ path: '/redirect' + view.fullPath })
    } else {
      router.push('/')
    }
  }
}
function activeStyle(tag) {
  if (!isActive(tag)) return {}
  return {
    'background-color': theme.value,
    'border-color': theme.value,
  }
}
</script>

<style scoped lang="scss">
.tags-view-container {
  height: 34px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.12),
    0 0 3px 0 rgba(0, 0, 0, 0.04);
}
.tags-view-item {
  display: inline-block;
  position: relative;
  cursor: pointer;
  height: 26px;
  line-height: 26px;
  border: 1px solid #d8dce5;
  color: #495060;
  background: #fff;
  padding: 0 8px;
  font-size: 12px;
  margin-left: 5px;
  margin-top: 4px;
  &:first-of-type {
    margin-left: 15px;
  }
  &:last-of-type {
    margin-right: 15px;
  }
  &.active {
    background-color: #42b983;
    color: #fff;
    border-color: #42b983;
    &::before {
      content: '';
      background: #fff;
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      position: relative;
      margin-right: 5px;
    }
  }
}
</style>
