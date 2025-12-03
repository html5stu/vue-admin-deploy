import request from '@/utils/request'

// 查询列表
export function listOperLog(params) {
  return request({
    url: '/operlog/list',
    method: 'get',
    params,
  })
}
