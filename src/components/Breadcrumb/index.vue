<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
        <span
          v-if="item.redirect === 'noRedirect' || index == levelList.length - 1"
          class="no-redirect"
          >{{ item.meta.title }}</span
        >
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { watchEffect, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const levelList = ref([])

const getBreadcrumb = () => {
  let matched = route.matched.filter((item) => item.meta && item.meta.title)
  const first = matched[0]
  // 判断是否为首页
  if (!isDashboard(first)) {
    matched = [{ path: '/index', meta: { title: '首页' } }].concat(matched)
  }
  levelList.value = matched.filter(
    (item) => item.meta && item.meta.title && item.meta.breadcrumb !== false
  )
}
function isDashboard(route) {
  const name = route && route.name
  if (!name) {
    return false
  }
  return name.trim() === 'Index'
}
function handleLink(item) {
  const { redirect, path } = item
  if (redirect) {
    router.push(redirect)
    return
  }
  router.push(path)
}
watchEffect(() => {
  getBreadcrumb()
})
</script>

<style scoped lang="scss">
.el-breadcrumb {
  line-height: 50px;
}
.no-redirect {
  color: #97a8be;
  cursor: text;
}
</style>
