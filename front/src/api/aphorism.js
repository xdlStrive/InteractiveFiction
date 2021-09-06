import request from '@/utils/request'

export function fetchAphorism() {
  return request({
    url: '/aphorism/fetch',
    method: 'get'
  })
}