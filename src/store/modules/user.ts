import { defineStore } from 'pinia'
import { login, getUserInfo } from '@/api/auth'

export const useUserStore = defineStore('user', {
  // 1. State: 定义数据状态
  state: () => ({
    token: localStorage.getItem('token') || '',
    // 用户信息初始为空
    userInfo: {
      username: '',
      nickname: '',
      roles: [] as string[],
      permissions: [] as string[],
      avatar: '',
    },
    // 标记用户信息是否已拉取
    isInfoLoaded: false,
  }),

  // 2. Actions: 定义业务逻辑
  actions: {
    // 动作一：登录
    async login(loginForm: any) {
      try {
        // 1. 调用登录接口
        const res: any = await login(loginForm)
        console.log('登录成功:', res)
        const token = res.data.token
        // 2. 存 Token 到 Pinia
        this.token = token
        // 3. 存 Token 到浏览器缓存 (持久化)
        localStorage.setItem('token', token)
        return res
      } catch (error) {
        return Promise.reject(error)
      }
    },

    async getInfo() {
      try {
        const res: any = await getUserInfo()
        this.userInfo = res.data
        localStorage.setItem('userInfo', JSON.stringify(res.data))
        this.isInfoLoaded = true
        return res
      } catch (error) {
        return Promise.reject(error)
      }
    },

    // 动作三：退出登录
    logout() {
      // 1. 清空 State
      this.token = ''
      this.userInfo = {
        username: '',
        nickname: '',
        roles: [],
        avatar: '',
        permissions: [],
      }
      // 2. 清空 LocalStorage
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      // --- 退出时重置为 false ---
      this.isInfoLoaded = false
      // 重定向到登录
      window.location.href = '/login'
    },
  },
})
