import request from '@/utils/request'

// 获取用户列表
export function getUserList(params: any) {
  return request({
    url: '/user/list',
    method: 'get',
    params,
  })
}

// 创建用户
export function createUser(data: any) {
  return request({
    url: '/user',
    method: 'post',
    data,
  })
}

// 更新用户
export function updateUser(data: any) {
  return request({
    url: '/user',
    method: 'put',
    data,
  })
}

// 删除用户
export function deleteUser(id: number) {
  return request({
    url: `/user/${id}`,
    method: 'delete',
  })
}
/**
 * 修改用户状态
 */
export function updateUserStatus(data) {
  return request({
    url: `/user/status`,
    method: 'post',
    data,
  })
}
