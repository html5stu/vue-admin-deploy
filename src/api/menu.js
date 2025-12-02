import request from '@/utils/request'

// 获取路由 侧边栏用
export const getRouters = () => {
  return request({
    url: '/menu/getRouters',
    method: 'get',
  })
}

// 获取菜单树 分配权限用
export const getMenuTreeSelect = () => {
  return request({
    url: '/menu/treeselect',
    method: 'get',
  })
}
// 获取菜单列表  菜单管理用
export const getMenuList = (params) => {
  return request({
    url: '/menu/list',
    method: 'get',
    params,
  })
}

/**
 * 菜单详情
 * @param {} data
 * @returns
 */
export const getMenu = (id) => {
  return request({ url: '/menu/getMenuById/?id=' + id, method: 'get' })
}

// 新增菜单
export const addMenu = (data) => {
  return request({ url: '/menu', method: 'post', data })
}
// 修改菜单
export const updateMenu = (data) => {
  return request({ url: '/menu', method: 'put', data })
}
// 删除菜单
export const delMenu = (id) => {
  return request({ url: '/menu/' + id, method: 'delete' })
}
