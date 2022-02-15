import request from '@/utils/request'

export function fetchAphorism() { // 获取格言
  return request({
    url: '/aphorism/fetch',
    method: 'get'
  })
}