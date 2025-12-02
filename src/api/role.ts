import request from '@/utils/request'

// 获取角色列表
export function getRoleList(params: any) {
  return request({
    url: '/role/list',
    method: 'get',
    params,
  })
}

// 获取角色详情
export function getRoleDetail(id: number) {
  return request({
    url: `/role/${id}`,
    method: 'get',
  })
}

// 创建角色
export function createRole(data: any) {
  return request({
    url: '/role',
    method: 'post',
    data,
  })
}

// 更新角色
export function updateRole(data: any) {
  return request({
    url: '/role',
    method: 'put',
    data,
  })
}

// 删除角色
export function deleteRole(id: number) {
  return request({
    url: `/role/${id}`,
    method: 'delete',
  })
}
/**
 * 修改角色状态
 */
export function updateRoleStatus(data) {
  return request({
    url: `/role/changeStatus`,
    method: 'post',
    data,
  })
}
// 获取角色关联的菜单ID集合
export const getRoleMenuTreeselect = (roleId: number) => {
  return request({
    url: `/role/roleMenuTreeselect/${roleId}`,
    method: 'get',
  })
}

// 保存角色权限
export const updateRolePermission = (data: {
  roleId: number
  menuIds: number[]
}) => {
  return request({
    url: '/role/authorization',
    method: 'post',
    data,
  })
}
