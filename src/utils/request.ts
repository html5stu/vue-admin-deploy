import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

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
      ElMessage.error(response.data.message)
      return Promise.reject(response.data.message)
    }
    return Promise.resolve(response.data)
  },
  (error) => {
    console.log('error', error)
    const status = error.response.status
    console.log('status', status)
    if (status === 401) {
      // 未登录或token过期
      ElMessage.error(error.response.data.message || '请先登录')
      // 可以在这里跳转到登录页面
      const userStore = useUserStore()
      userStore.logout() // 触发退出逻辑（清缓存+跳
    } else if (status === 403) {
      // 没有权限
      ElMessage.error(error.response.data.message || '没有权限访问')
    } else if (status === 404) {
      // 请求的资源不存在
      ElMessage.error('请求的资源不存在')
      return Promise.reject(error)
    } else if (status >= 500) {
      // 服务器错误
      ElMessage.error(error.response.data.message || '服务器错误，请稍后再试')
      return Promise.reject(error)
    } else {
      // 其他错误
      ElMessage.error(error.response.data.message || '请求失败，请稍后再试')
      return Promise.reject(error)
    }
  }
)

export default request
