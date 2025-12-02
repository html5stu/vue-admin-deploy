<template>
  <div class="header-search" :class="{ show: show }">
    <el-icon color="#999" size="20" @click.stop="click" class="search-icon">
      <Search />
    </el-icon>
    <el-select
      ref="headerSearchSelectRef"
      v-model="search"
      :remote-method="querySearch"
      filterable
      default-first-option
      remote
      placeholder="Search"
      class="header-search-select"
      @change="change"
    >
      <el-option
        v-for="option in options"
        :key="option.item.path"
        :value="option.item"
        :label="option.item.title.join(' > ')"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { getNormalPath, isHttp } from '@/utils/tools'
import { ref, onMounted, watch, computed, watchEffect } from 'vue'
const search = ref('')
const options = ref<any[]>([])
const headerSearchSelectRef = ref<any>(null)
import { useRouter, useRoute } from 'vue-router'
import { usePermissionStore } from '@/store/modules/permission'
const permissionStore = usePermissionStore()
const routes = computed(() => permissionStore.routes)
const show = ref(false)
const router = useRouter()
const route = useRoute()
// 生成可搜索的路由列表
const searchPool = ref<any[]>([])

watch(show, (value) => {
  if (value) {
    document.body.addEventListener('click', close)
  } else {
    document.body.removeEventListener('click', close)
  }
})
onMounted(() => {
  searchPool.value = generateRoutes(routes.value)
  console.log('searchPool11', searchPool.value)
})

function generateRoutes(routes, basePath = '', prefixTitle = []) {
  console.log('prefixTitle', prefixTitle)

  let res = []
  for (const r of routes) {
    if (r.hidden) continue
    const p = r.path.length > 0 && r.path[0] == '/' ? r.path : '/' + r.path
    const data = {
      path: !isHttp(r.path) ? getNormalPath(basePath + p) : r.path,
      title: [...prefixTitle],
    }
    if (r.meta && r.meta.title) {
      data.title = [...data.title, r.meta.title]
      if (r.redirect !== 'noRedirect') {
        res.push(data)
      }
    }
    if (r.query) {
      data.query = r.query
    }
    //
    if (r.children) {
      const tempRoutes = generateRoutes(r.children, data.path, data.title)
      res = res.concat(tempRoutes)
    }
  }
  return res
}
watchEffect(() => {
  searchPool.value = generateRoutes(routes.value)
  console.log('searchPool22', searchPool.value)
})
function close() {
  headerSearchSelectRef.value && headerSearchSelectRef.value.blur()
  show.value = false
  options.value = []
}
function click() {
  show.value = !show.value
  if (show.value) {
    headerSearchSelectRef.value && headerSearchSelectRef.value.focus()
  }
}
const querySearch = (queryString: string) => {}

const change = (item: any) => {}
</script>

<style scoped lang="scss">
.header-search {
  font-size: 0 !important;

  .search-icon {
    cursor: pointer;
    font-size: 18px;
    vertical-align: middle;
  }

  .header-search-select {
    font-size: 18px;
    transition: width 0.2s;
    width: 0;
    overflow: hidden;
    background: transparent;
    border-radius: 0;
    display: inline-block;
    vertical-align: middle;

    :deep(.el-input__inner) {
      border-radius: 0;
      border: 0;
      padding-left: 0;
      padding-right: 0;
      box-shadow: none !important;
      border-bottom: 1px solid #d9d9d9;
      vertical-align: middle;
    }
  }

  &.show {
    .header-search-select {
      width: 210px;
      margin-left: 10px;
    }
  }
}
</style>
