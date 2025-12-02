import request from '@/utils/request'

export const getMenu = () =>
  request({
    url: '/my/route/getMenus',
    method: 'get',
  })
