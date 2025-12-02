import { defineStore } from 'pinia'
import { constantRoutes } from '@/router'
import { getRouters } from '@/api/menu'
import Layout from '@/layout/index.vue'

// 1. 匹配 views 里面所有的 .vue 文件
// 结果类似: { '../../views/system/user.vue': () => import(...) }
const modules = import.meta.glob('../../views/**/*.vue')

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [], // 完整路由 (侧边栏用)
    addRoutes: [], // 动态添加的路由
    sidebarRouters: [], // 侧边栏路由
  }),

  actions: {
    // 设置动态路由和完整路由
    // 注意：这里的 routes 是后端返回的路由数据，需要根据你的实际数据结构进行修改
    setRoutes(routes) {
      this.addRoutes = routes
      this.routes = constantRoutes.concat(routes)
    },
    // 设置侧边栏路由
    setSidebarRouters(routes) {
      this.sidebarRouters = routes
    },
    // 生成路由
    async generateRoutes() {
      return new Promise(async (resolve, reject) => {
        try {
          // 1. 向后端请求路由数据
          const res = await getRouters()
          const sdata = JSON.parse(JSON.stringify(res.data)) // 深拷贝
          const rdata = JSON.parse(JSON.stringify(res.data))

          // 2. 将后端数据转换为 Vue Router 格式
          const sidebarRoutes = filterAsyncRouter(sdata)
          const rewriteRoutes = filterAsyncRouter(rdata, false, true)
          // 设置侧边栏路由
          this.setSidebarRouters(constantRoutes.concat(sidebarRoutes))
          // 设置动态路由和完整路由
          this.setRoutes(rewriteRoutes)

          resolve(rewriteRoutes)
        } catch (error) {
          reject(error)
        }
      })
    },
  },
})

// --- 辅助函数：将后端数据转为 Vue 路由 ---
function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  return asyncRouterMap.filter((route) => {
    // 【核心容错】：如果是一级菜单（没有 lastRouter），但 component 不是 Layout
    // 这种路由加进去也是废的，直接过滤掉，或者强制改为 Layout
    if (!lastRouter && route.component !== 'Layout') {
      // 策略A: 强制修正 (建议)
      console.warn(
        `[路由修正] 顶级菜单 ${route.path} 的组件不是 Layout，已强制修正。`
      )
      route.component = 'Layout'
    }

    // 处理 component
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }

    if (route.component) {
      // 1. Layout 组件特殊处理
      if (route.component === 'Layout') {
        route.component = Layout
      } else {
        // 2. 动态加载 views 下的组件
        // 注意：这里需要根据你的实际目录结构拼接路径
        route.component = loadView(route.component)
      }
    }

    // 处理 children
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
    } else {
      delete route['children']
      delete route['redirect']
    }
    return true
  })
}

function filterChildren(childrenMap, lastRouter = false) {
  var children = []
  childrenMap.forEach((el) => {
    if (el.children && el.children.length) {
      if (el.component === 'ParentView' && !lastRouter) {
        el.children.forEach((c) => {
          c.path = el.path + '/' + c.path
          if (c.children && c.children.length) {
            children.push(c)
            return
          }
          children.push(c)
        })
        return
      }
    }
    if (lastRouter) {
      el.path = lastRouter.path + '/' + el.path
    }
    children = children.concat(el)
  })
  return children
}

// 核心：加载组件
export const loadView = (view) => {
  let res
  for (const path in modules) {
    const dir = path.split('views/')[1].split('.vue')[0]
    if (dir === view) {
      res = () => modules[path]()
    }
  }
  // 【核心容错】：如果找不到组件，返回一个 404 组件，防止路由注册失败导致白屏
  if (!res) {
    console.warn(`[路由加载失败] 找不到组件: ${view}，已自动替换为 404 组件。`)
    // 确保你有这个文件，或者用 Layout 代替也行
    return () => import('@/views/error/404.vue')
  }
  return res
}
