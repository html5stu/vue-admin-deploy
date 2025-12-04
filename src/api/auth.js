import request from '@/utils/request'

// 登录 (只返回 token)
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data,
  })
}

// 获取验证码
export function getCaptcha() {
  return request({
    url: '/auth/captcha',
    method: 'get',
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/auth/info',
    method: 'get',
  })
}
