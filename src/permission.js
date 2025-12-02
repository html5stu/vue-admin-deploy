import router from '@/router'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission' // 引入新的 store
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/404']

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  if (userStore.token) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      // 判断当前用户是否已拉取完 user_info 信息
      // 这里我们可以简单判断：如果 userStore.userInfo.roles.length==0 动态添加的菜单长度为0，说明还没请求菜单,但似乎 这么写  如果 用户没角色  会陷入死循环
      if (!userStore.isInfoLoaded) {
        try {
          // 2. 生成动态路由 (后端请求)
          const userInfo = await userStore.getInfo()
          console.log('userInfo--', userInfo)
          if (userInfo && userInfo.data.id) {
            const accessRoutes = await permissionStore.generateRoutes()
            // // 3. 后端返回的路由
            console.log('accessRoutes', accessRoutes)
            // 4. 动态添加路由
            accessRoutes.forEach((route) => {
              router.addRoute(route)
            })
          }
          // 4. 确保路由添加完成 (Hack方法)
          next({ path: to.path, query: to.query, replace: true })
        } catch (err) {
          console.log('userinfo -err', err)
          userStore.logout()
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      } else {
        next()
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
      console.log('to.path', to.path)
      next()
    } else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
