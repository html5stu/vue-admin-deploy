import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
let isErrorMessageShowing = false
// 定义一个变量标记是否正在重新登录
let isReloginShow = false

function handle401() {
  // 如果已经弹出了框，就不要再弹了
  if (isReloginShow) return

  isReloginShow = true // 加锁

  ElMessageBox.confirm(
    '登录状态已过期，您可以继续留在该页面，或者重新登录',
    '系统提示',
    {
      confirmButtonText: '重新登录',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 点击确定
      isReloginShow = false // 解锁
      const userStore = useUserStore()
      userStore.logout() // 登出并跳转
    })
    .catch(() => {
      // 点击取消
      isReloginShow = false // 解锁
    })
}
/**
 * 统一错误提示函数（节流版）
 * 规则：3秒内只弹出一个错误提示，防止并发请求失败瞬间刷屏
 */
const showError = (msg) => {
  if (isErrorMessageShowing) {
    return // 如果锁住了，直接返回，不再弹窗
  }
  isErrorMessageShowing = true // 上锁
  ElMessage.error({
    message: msg,
    duration: 3000, // 提示停留时间
  })

  // 3秒后解锁
  setTimeout(() => {
    isErrorMessageShowing = false
  }, 3000)
}

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
request.interceptors.request.use((config) => {
  // 在发送请求之前做些什么
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    console.log('response', response)
    if (response.data.code != 200) {
      showError(response.data.message)
      return Promise.reject(response.data.message)
    }
    return Promise.resolve(response.data)
  },
  (error) => {
    let message = ''
    // 增加判空处理，防止断网时 error.response 为 undefined 导致代码报错
    const status = error.response ? error.response.status : 0
    if (status === 401) {
      handle401()
      return Promise.reject(error)
    } else if (status === 403) {
      // 没有权限
      message = error.response.data.message || '没有权限访问'
    } else if (status === 404) {
      // 请求的资源不存在
      message = '请求的资源不存在'
    } else if (status >= 500) {
      // 服务器错误
      message = error.response.data.message || '服务器错误，请稍后再试'
    } else {
      // 其他错误
      message = error.message || '请求失败，请检查网络'
    }
    showError(message)

    return Promise.reject(error)
  }
)

export default request
